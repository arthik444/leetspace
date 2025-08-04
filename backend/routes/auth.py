from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserCreate, User, UserInDB, Token, TokenResponse, RefreshTokenRequest, UserProfileUpdate, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest
from auth.verify_token import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    get_current_active_user,
    get_user_by_email,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
# Use MongoDB for user operations
from db.user_operations import create_user, user_db
from db.token_blacklist import blacklist_token, blacklist_all_user_tokens
from db.refresh_tokens import create_refresh_token, verify_refresh_token, revoke_refresh_token, revoke_all_user_refresh_tokens
from db.password_reset import create_password_reset_token, verify_password_reset_token, mark_reset_token_used
from jose import jwt, JWTError
import os

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):
    """Register a new user."""
    print(f"📝 Registration attempt for email: {user.email}")
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        print(f"⚠️ Registration failed - email already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    try:
        # Create new user
        hashed_password = get_password_hash(user.password)
        user_data = {
            "email": user.email,
            "full_name": user.full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        created_user = await create_user(user_data)
        print(f"✅ User registered successfully: {user.email}")
        return User(**created_user.model_dump())
        
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        raise
    except Exception as e:
        print(f"❌ Unexpected error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to server error"
        )
    

@router.post("/login", response_model=TokenResponse)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token and refresh tokens."""
    user = await authenticate_user(form_data.username, form_data.password)  # username is email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = await create_refresh_token(str(user.id))
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    }

@router.post("/login/json", response_model=TokenResponse)
async def login_user_json(user_credentials: dict):
    """Authenticate user with JSON credentials and return access token."""
    email = user_credentials.get("email")
    password = user_credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = await create_refresh_token(str(user.id))
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    }

@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user profile."""
    return User(**current_user.model_dump())

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_request: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    user_id = await verify_refresh_token(refresh_request.refresh_token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user from database
    from db.user_operations import find_user_by_id
    user = await find_user_by_id(user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Optionally create new refresh token (refresh token rotation)
    new_refresh_token = await create_refresh_token(str(user.id))
    
    # Revoke old refresh token
    await revoke_refresh_token(refresh_request.refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/verify")
async def verify_token(current_user: UserInDB = Depends(get_current_active_user)):
    """Verify if token is valid."""
    return {"valid": True, "user": User(**current_user.model_dump())}

@router.post("/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Logout user by blacklisting the current token."""
    try:
        token = credentials.credentials
        # Decode token to get JTI and expiration
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        jti = payload.get("jti")
        exp = payload.get("exp")
        
        if exp:
            expires_at = datetime.fromtimestamp(exp)
            
            # Handle tokens without JTI (older tokens)
            if not jti:
                # Generate a unique identifier for the token itself
                import hashlib
                jti = hashlib.sha256(token.encode()).hexdigest()[:16]
            
            success = await blacklist_token(token, jti, expires_at)
            
            if success:
                return {"message": "Successfully logged out"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to logout"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token format"
            )
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.post("/logout-all")
async def logout_all_devices(current_user: UserInDB = Depends(get_current_active_user)):
    """Logout user from all devices by blacklisting all user tokens."""
    try:
        # Blacklist all access tokens
        await blacklist_all_user_tokens(str(current_user.id))
        # Revoke all refresh tokens
        await revoke_all_user_refresh_tokens(str(current_user.id))
        return {"message": "Successfully logged out from all devices"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to logout from all devices"
        )

@router.put("/profile", response_model=User)
async def update_profile(
    profile_update: UserProfileUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update user profile."""
    update_data = {}
    
    # Only update fields that are provided
    if profile_update.full_name is not None:
        update_data["full_name"] = profile_update.full_name
    
    if profile_update.email is not None:
        # Check if email is already taken by another user
        existing_user = await get_user_by_email(profile_update.email)
        if existing_user and str(existing_user.id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        update_data["email"] = profile_update.email
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updated_user = await user_db.update_user(str(current_user.id), update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(**updated_user.model_dump())

@router.post("/change-password")
async def change_password(
    password_change: ChangePasswordRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Change user password."""
    # Verify current password
    if not verify_password(password_change.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Hash new password
    hashed_new_password = get_password_hash(password_change.new_password)
    
    # Update password in database
    update_data = {"hashed_password": hashed_new_password}
    updated_user = await user_db.update_user(str(current_user.id), update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Optionally, blacklist all existing tokens to force re-login
    await blacklist_all_user_tokens(str(current_user.id))
    
    return {"message": "Password changed successfully. Please log in again."}

@router.delete("/account")
async def delete_account(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete user account (soft delete by deactivating)."""
    # Soft delete by setting is_active to False
    update_data = {"is_active": False}
    updated_user = await user_db.update_user(str(current_user.id), update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Blacklist all user tokens
    await blacklist_all_user_tokens(str(current_user.id))
    
    return {"message": "Account deactivated successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset token."""
    user = await get_user_by_email(request.email)
    
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # Create reset token
    reset_token = await create_password_reset_token(str(user.id), user.email)
    
    # In a real application, you would send this token via email
    # For now, we'll return it in the response (NOT SECURE - only for development)
    print(f"🔑 Password reset token for {user.email}: {reset_token}")
    
    return {
        "message": "If the email exists, a password reset link has been sent",
        "dev_token": reset_token  # Remove this in production!
    }

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token."""
    token_info = await verify_password_reset_token(request.token)
    
    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Mark token as used
    token_used = await mark_reset_token_used(request.token)
    if not token_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has already been used"
        )
    
    # Hash new password
    hashed_password = get_password_hash(request.new_password)
    
    # Update password in database
    update_data = {"hashed_password": hashed_password}
    updated_user = await user_db.update_user(token_info["user_id"], update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Blacklist all existing tokens to force re-login
    await blacklist_all_user_tokens(token_info["user_id"])
    await revoke_all_user_refresh_tokens(token_info["user_id"])
    
    return {"message": "Password reset successfully. Please log in with your new password."}

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is working."""
    return {"message": "✅ Authentication system is working!", "timestamp": datetime.utcnow()}