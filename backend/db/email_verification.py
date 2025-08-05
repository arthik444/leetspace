import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict
from motor.motor_asyncio import AsyncIOMotorCollection
from db.mongo import db
from pymongo import IndexModel
import logging

logger = logging.getLogger(__name__)

class EmailVerificationManager:
    """Manages email verification tokens"""
    
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection
    
    async def ensure_indexes(self):
        """Create indexes for optimized queries."""
        indexes = [
            IndexModel([("token", 1)], unique=True),
            IndexModel([("user_id", 1)]),
            IndexModel([("email", 1)]),
            IndexModel([("expires_at", 1)], expireAfterSeconds=0),  # TTL index
            IndexModel([("created_at", -1)])
        ]
        await self.collection.create_indexes(indexes)
    
    async def create_verification_token(self, user_id: str, email: str, expires_hours: int = 24) -> str:
        """Create a new email verification token."""
        try:
            # Generate a secure random token
            token = secrets.token_urlsafe(32)
            
            # Calculate expiration time
            expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
            
            # Clean up any existing tokens for this user
            await self.collection.delete_many({"user_id": user_id})
            
            verification_data = {
                "token": token,
                "user_id": user_id,
                "email": email,
                "created_at": datetime.utcnow(),
                "expires_at": expires_at,
                "used": False,
                "used_at": None
            }
            
            await self.collection.insert_one(verification_data)
            logger.info(f"Created email verification token for user {user_id}")
            return token
            
        except Exception as e:
            logger.error(f"Failed to create verification token for user {user_id}: {str(e)}")
            raise
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        """Verify a verification token and return user information."""
        try:
            verification_doc = await self.collection.find_one({
                "token": token,
                "used": False,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            
            if verification_doc:
                logger.info(f"Verification token verified for user {verification_doc['user_id']}")
                return {
                    "user_id": verification_doc["user_id"],
                    "email": verification_doc["email"]
                }
            else:
                logger.warning(f"Invalid or expired verification token: {token[:16]}...")
                return None
                
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None
    
    async def mark_token_used(self, token: str) -> bool:
        """Mark a verification token as used."""
        try:
            result = await self.collection.update_one(
                {"token": token, "used": False},
                {
                    "$set": {
                        "used": True,
                        "used_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Marked verification token as used: {token[:16]}...")
                return True
            else:
                logger.warning(f"Failed to mark token as used - token not found or already used: {token[:16]}...")
                return False
                
        except Exception as e:
            logger.error(f"Error marking token as used: {str(e)}")
            return False
    
    async def clean_expired_tokens(self) -> int:
        """Clean up expired verification tokens."""
        try:
            result = await self.collection.delete_many({
                "expires_at": {"$lt": datetime.utcnow()}
            })
            
            deleted_count = result.deleted_count
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} expired verification tokens")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning expired tokens: {str(e)}")
            return 0
    
    async def revoke_user_tokens(self, user_id: str) -> int:
        """Revoke all verification tokens for a user."""
        try:
            result = await self.collection.delete_many({"user_id": user_id})
            deleted_count = result.deleted_count
            
            if deleted_count > 0:
                logger.info(f"Revoked {deleted_count} verification tokens for user {user_id}")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error revoking tokens for user {user_id}: {str(e)}")
            return 0
    
    async def get_token_info(self, token: str) -> Optional[Dict]:
        """Get information about a verification token."""
        try:
            token_doc = await self.collection.find_one({"token": token})
            
            if token_doc:
                return {
                    "user_id": token_doc["user_id"],
                    "email": token_doc["email"],
                    "created_at": token_doc["created_at"],
                    "expires_at": token_doc["expires_at"],
                    "used": token_doc["used"],
                    "used_at": token_doc.get("used_at"),
                    "is_expired": token_doc["expires_at"] < datetime.utcnow()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting token info: {str(e)}")
            return None

# Initialize verification manager
verification_collection = db["email_verifications"]
email_verification_manager = EmailVerificationManager(verification_collection)

# Convenience functions
async def create_verification_token(user_id: str, email: str, expires_hours: int = 24) -> str:
    """Create email verification token."""
    return await email_verification_manager.create_verification_token(user_id, email, expires_hours)

async def verify_verification_token(token: str) -> Optional[Dict]:
    """Verify email verification token."""
    return await email_verification_manager.verify_token(token)

async def mark_verification_token_used(token: str) -> bool:
    """Mark verification token as used."""
    return await email_verification_manager.mark_token_used(token)

async def revoke_user_verification_tokens(user_id: str) -> int:
    """Revoke all verification tokens for user."""
    return await email_verification_manager.revoke_user_tokens(user_id)

async def ensure_verification_indexes():
    """Ensure email verification collection indexes."""
    await email_verification_manager.ensure_indexes()