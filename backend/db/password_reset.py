from typing import Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorCollection
from db.mongo import db
import secrets
import hashlib

# Password reset token configuration
RESET_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes

class PasswordResetManager:
    def __init__(self):
        self.collection: AsyncIOMotorCollection = db["password_reset_tokens"]
    
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
        """Hash the reset token for storage."""
        return hashlib.sha256(token.encode()).hexdigest()
    
    async def create_reset_token(self, user_id: str, email: str) -> str:
        """Create a password reset token for a user."""
        # Invalidate any existing reset tokens for this user
        await self.collection.update_many(
            {"user_id": user_id, "is_active": True},
            {"$set": {"is_active": False}}
        )
        
        # Generate a cryptographically secure random token
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)
        
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
        
        # Store the hashed token in database
        await self.collection.insert_one({
            "token_hash": token_hash,
            "user_id": user_id,
            "email": email,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_active": True,
            "used": False
        })
        
        return token
    
    async def verify_reset_token(self, token: str) -> Optional[dict]:
        """Verify a reset token and return user info if valid."""
        token_hash = self._hash_token(token)
        
        # Find the token in database
        token_doc = await self.collection.find_one({
            "token_hash": token_hash,
            "is_active": True,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if token_doc:
            return {
                "user_id": token_doc["user_id"],
                "email": token_doc["email"]
            }
        return None
    
    async def mark_token_used(self, token: str) -> bool:
        """Mark a reset token as used."""
        token_hash = self._hash_token(token)
        
        result = await self.collection.update_one(
            {
                "token_hash": token_hash,
                "is_active": True,
                "used": False
            },
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    async def invalidate_user_tokens(self, user_id: str) -> int:
        """Invalidate all reset tokens for a user."""
        result = await self.collection.update_many(
            {"user_id": user_id, "is_active": True},
            {"$set": {"is_active": False}}
        )
        
        return result.modified_count
    
    async def cleanup_expired_tokens(self) -> int:
        """Clean up expired tokens manually."""
        result = await self.collection.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count

# Global instance
password_reset_manager = PasswordResetManager()

# Convenience functions
async def create_password_reset_token(user_id: str, email: str) -> str:
    """Create a password reset token."""
    return await password_reset_manager.create_reset_token(user_id, email)

async def verify_password_reset_token(token: str) -> Optional[dict]:
    """Verify a password reset token."""
    return await password_reset_manager.verify_reset_token(token)

async def mark_reset_token_used(token: str) -> bool:
    """Mark a reset token as used."""
    return await password_reset_manager.mark_token_used(token)

async def invalidate_user_reset_tokens(user_id: str) -> int:
    """Invalidate all reset tokens for a user."""
    return await password_reset_manager.invalidate_user_tokens(user_id)

async def ensure_password_reset_indexes():
    """Ensure password reset indexes."""
    await password_reset_manager.ensure_indexes()