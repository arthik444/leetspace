from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.encoders import jsonable_encoder
from typing import Dict, Any, Optional
from datetime import datetime

from db.mongo import db
from models.user import UserCreate, UserInDB, UserUpdate, UserPublic
from auth.verify_token import get_current_user, get_current_user_optional
from bson import ObjectId
import logging

router = APIRouter()
users_collection = db["users"]

@router.post("/register", response_model=UserPublic)
async def register_user(
    user_data: UserCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Register a new user or update existing user data
    This endpoint is called after Firebase authentication
    """
    firebase_uid = current_user.get("uid")
    
    # Verify the Firebase UID matches the request
    if firebase_uid != user_data.firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase UID mismatch"
        )
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"firebase_uid": firebase_uid})
    if existing_user:
        # Update last login
        await users_collection.update_one(
            {"firebase_uid": firebase_uid},
            {
                "$set": {
                    "security.last_login": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        existing_user["id"] = str(existing_user["_id"])
        return UserPublic(**existing_user)
    
    # Create new user
    user_dict = {
        "firebase_uid": firebase_uid,
        "email": user_data.email,
        "email_verified": current_user.get("email_verified", False),
        "profile": {
            "display_name": user_data.display_name or current_user.get("name"),
            "bio": None,
            "github_username": None,
            "linkedin_url": None,
            "website_url": None,
            "preferred_language": "python",
            "timezone": "UTC"
        },
        "stats": {
            "total_problems_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "current_streak": 0,
            "max_streak": 0,
            "total_time_spent_minutes": 0,
            "favorite_tags": []
        },
        "preferences": {
            "email_notifications": True,
            "daily_reminder": False,
            "weekly_summary": True,
            "theme": "light",
            "language": "en"
        },
        "security": {
            "last_login": datetime.utcnow(),
            "last_password_change": None,
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "two_factor_enabled": False,
            "backup_codes": [],
            "trusted_devices": []
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "is_admin": False,
        "subscription_tier": "free"
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return UserPublic(**user_dict)

@router.get("/me", response_model=UserPublic)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current user's profile"""
    firebase_uid = current_user.get("uid")
    
    user = await users_collection.find_one({"firebase_uid": firebase_uid})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    user["id"] = str(user["_id"])
    return UserPublic(**user)

@router.put("/me", response_model=UserPublic)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update current user's profile"""
    firebase_uid = current_user.get("uid")
    
    update_data = {}
    if user_update.profile:
        update_data["profile"] = user_update.profile.dict()
    if user_update.preferences:
        update_data["preferences"] = user_update.preferences.dict()
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await users_collection.find_one_and_update(
        {"firebase_uid": firebase_uid},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    result["id"] = str(result["_id"])
    return UserPublic(**result)

@router.delete("/me")
async def delete_current_user_account(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete current user's account and all associated data"""
    firebase_uid = current_user.get("uid")
    
    # Delete user's problems
    problems_collection = db["problems"]
    await problems_collection.delete_many({"user_id": firebase_uid})
    
    # Delete user account
    result = await users_collection.delete_one({"firebase_uid": firebase_uid})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"detail": "Account deleted successfully"}

@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Get public profile of any user"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except:
        # Try finding by Firebase UID
        user = await users_collection.find_one({"firebase_uid": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user["id"] = str(user["_id"])
    return UserPublic(**user)

@router.get("/check-auth")
async def check_authentication(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Simple endpoint to check if user is authenticated"""
    return {
        "authenticated": True,
        "uid": current_user.get("uid"),
        "email": current_user.get("email")
    }