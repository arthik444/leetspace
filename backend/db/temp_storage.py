# MongoDB storage for users 
from typing import Optional
from models.user import UserInDB
from datetime import datetime
from db.mongo import db
from bson import ObjectId

# MongoDB collection
users_collection = db["users"]

async def find_user_by_email(email: str) -> Optional[UserInDB]:
    """Find user by email in MongoDB."""
    user_data = await users_collection.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None

async def create_user(user_data: dict) -> UserInDB:
    """Create user in MongoDB."""
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    user_data["id"] = str(result.inserted_id)
    
    return UserInDB(**user_data)

async def get_all_users() -> list[UserInDB]:
    """Get all users from MongoDB."""
    users = []
    cursor = users_collection.find({})
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        users.append(UserInDB(**doc))
    return users

def clear_users():
    """Clear all users (for testing)."""
    # This would be an async function in real implementation
    pass