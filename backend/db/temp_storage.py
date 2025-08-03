# Temporary in-memory storage for testing without MongoDB
from typing import Dict, List, Optional
from models.user import UserInDB
from datetime import datetime

# In-memory storage
users_db: Dict[str, UserInDB] = {}

async def find_user_by_email(email: str) -> Optional[UserInDB]:
    """Find user by email in memory storage."""
    return users_db.get(email)

async def create_user(user_data: dict) -> UserInDB:
    """Create user in memory storage."""
    user = UserInDB(**user_data)
    users_db[user.email] = user
    return user

async def get_all_users() -> List[UserInDB]:
    """Get all users from memory storage."""
    return list(users_db.values())

def clear_users():
    """Clear all users (for testing)."""
    global users_db
    users_db = {}