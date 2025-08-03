# db/user_operations.py
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorCollection
from models.user import UserInDB, UserCreate
from db.mongo import users_collection
from bson import ObjectId
from datetime import datetime
from pymongo import IndexModel
from fastapi import HTTPException

class UserDatabase:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection
    
    async def ensure_indexes(self):
        """Create indexes for optimized queries."""
        indexes = [
            IndexModel([("email", 1)], unique=True),
            IndexModel([("created_at", -1)]),
            IndexModel([("is_active", 1)])
        ]
        await self.collection.create_indexes(indexes)
    
    async def find_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Find user by email in MongoDB."""
        try:
            user_doc = await self.collection.find_one({"email": email})
            if user_doc:
                # Convert ObjectId to string for Pydantic
                user_doc["_id"] = str(user_doc["_id"])
                return UserInDB(**user_doc)
            return None
        except Exception as e:
            print(f"MongoDB error in find_user_by_email: {e}")
            return None
    
    async def find_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Find user by ID in MongoDB."""
        if not ObjectId.is_valid(user_id):
            return None
        
        user_doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user_doc:
            # Convert ObjectId to string for Pydantic
            user_doc["_id"] = str(user_doc["_id"])
            return UserInDB(**user_doc)
        return None
    
    async def create_user(self, user_data: dict) -> UserInDB:
        """Create user in MongoDB."""
        try:
            # Ensure timestamps
            now = datetime.utcnow()
            user_data.setdefault("created_at", now)
            user_data.setdefault("updated_at", now)
            user_data.setdefault("is_active", True)
            
            result = await self.collection.insert_one(user_data)
            # Convert ObjectId to string for Pydantic
            user_data["_id"] = str(result.inserted_id)
            return UserInDB(**user_data)
        except Exception as e:
            print(f"MongoDB error in create_user: {e}")
            # Check if it's a duplicate key error (email already exists)
            if "E11000" in str(e) or "duplicate key" in str(e).lower():
                raise HTTPException(
                    status_code=400, 
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=503, 
                    detail="Database service unavailable"
                )
    
    async def update_user(self, user_id: str, update_data: dict) -> Optional[UserInDB]:
        """Update user in MongoDB."""
        if not ObjectId.is_valid(user_id):
            return None
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            # Convert ObjectId to string for Pydantic
            result["_id"] = str(result["_id"])
            return UserInDB(**result)
        return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user from MongoDB."""
        if not ObjectId.is_valid(user_id):
            return False
        
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[UserInDB]:
        """Get all users from MongoDB with pagination."""
        cursor = self.collection.find().skip(skip).limit(limit)
        users = []
        async for doc in cursor:
            # Convert ObjectId to string for Pydantic
            doc["_id"] = str(doc["_id"])
            users.append(UserInDB(**doc))
        return users
    
    async def count_users(self) -> int:
        """Count total users in MongoDB."""
        return await self.collection.count_documents({})
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[UserInDB]:
        """Get active users from MongoDB."""
        cursor = self.collection.find({"is_active": True}).skip(skip).limit(limit)
        users = []
        async for doc in cursor:
            # Convert ObjectId to string for Pydantic
            doc["_id"] = str(doc["_id"])
            users.append(UserInDB(**doc))
        return users

# Initialize user database instance
user_db = UserDatabase(users_collection)

# Convenience functions for backwards compatibility
async def find_user_by_email(email: str) -> Optional[UserInDB]:
    """Find user by email."""
    return await user_db.find_user_by_email(email)

async def find_user_by_id(user_id: str) -> Optional[UserInDB]:
    """Find user by ID."""
    return await user_db.find_user_by_id(user_id)

async def create_user(user_data: dict) -> UserInDB:
    """Create user."""
    return await user_db.create_user(user_data)

async def get_all_users() -> List[UserInDB]:
    """Get all users."""
    return await user_db.get_all_users()

async def ensure_user_indexes():
    """Ensure user collection indexes."""
    await user_db.ensure_indexes()