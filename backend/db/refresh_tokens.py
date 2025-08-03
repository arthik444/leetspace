from typing import Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorCollection
from db.mongo import db
import secrets
import hashlib

# Refresh token configuration
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days

class RefreshTokenManager:
    def __init__(self):
        self.collection: AsyncIOMotorCollection = db["refresh_tokens"]
    
    async def ensure_indexes(self):
        """Create indexes for optimized queries."""
        # TTL index to automatically remove expired tokens
        await self.collection.create_index(
            "expires_at", 
            expireAfterSeconds=0
        )
        await self.collection.create_index("token_hash", unique=True)
        await self.collection.create_index("user_id")
    
    def _hash_token(self, token: str) -> str:
        """Hash the refresh token for storage."""
        return hashlib.sha256(token.encode()).hexdigest()
    
    async def create_refresh_token(self, user_id: str) -> str:
        """Create a new refresh token for a user."""
        # Generate a cryptographically secure random token
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)
        
        expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Store the hashed token in database
        await self.collection.insert_one({
            "token_hash": token_hash,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_active": True
        })
        
        return token
    
    async def verify_refresh_token(self, token: str) -> Optional[str]:
        """Verify a refresh token and return the user_id if valid."""
        token_hash = self._hash_token(token)
        
        # Find the token in database
        token_doc = await self.collection.find_one({
            "token_hash": token_hash,
            "is_active": True,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if token_doc:
            return token_doc["user_id"]
        return None
    
    async def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a specific refresh token."""
        token_hash = self._hash_token(token)
        
        result = await self.collection.update_one(
            {"token_hash": token_hash},
            {"$set": {"is_active": False}}
        )
        
        return result.modified_count > 0
    
    async def revoke_all_user_tokens(self, user_id: str) -> int:
        """Revoke all refresh tokens for a user."""
        result = await self.collection.update_many(
            {"user_id": user_id, "is_active": True},
            {"$set": {"is_active": False}}
        )
        
        return result.modified_count
    
    async def cleanup_expired_tokens(self) -> int:
        """Clean up expired tokens manually (MongoDB TTL should handle this)."""
        result = await self.collection.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count
    
    async def get_user_token_count(self, user_id: str) -> int:
        """Get the number of active refresh tokens for a user."""
        count = await self.collection.count_documents({
            "user_id": user_id,
            "is_active": True,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        return count

# Global instance
refresh_token_manager = RefreshTokenManager()

# Convenience functions
async def create_refresh_token(user_id: str) -> str:
    """Create a refresh token for a user."""
    return await refresh_token_manager.create_refresh_token(user_id)

async def verify_refresh_token(token: str) -> Optional[str]:
    """Verify a refresh token."""
    return await refresh_token_manager.verify_refresh_token(token)

async def revoke_refresh_token(token: str) -> bool:
    """Revoke a refresh token."""
    return await refresh_token_manager.revoke_refresh_token(token)

async def revoke_all_user_refresh_tokens(user_id: str) -> int:
    """Revoke all refresh tokens for a user."""
    return await refresh_token_manager.revoke_all_user_tokens(user_id)

async def ensure_refresh_token_indexes():
    """Ensure refresh token indexes."""
    await refresh_token_manager.ensure_indexes()