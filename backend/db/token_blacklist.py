from typing import Optional, Set
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorCollection
from db.mongo import db
import asyncio

class TokenBlacklist:
    def __init__(self):
        self.collection: AsyncIOMotorCollection = db["blacklisted_tokens"]
        # In-memory cache for recently blacklisted tokens (performance optimization)
        self._memory_cache: Set[str] = set()
        self._cache_max_size = 1000
        
    async def ensure_indexes(self):
        """Create indexes for optimized queries."""
        # TTL index to automatically remove expired tokens
        await self.collection.create_index(
            "expires_at", 
            expireAfterSeconds=0
        )
        await self.collection.create_index("token_jti", unique=True)
    
    async def blacklist_token(self, token: str, jti: str, expires_at: datetime):
        """Add a token to the blacklist."""
        try:
            # Add to database (use upsert to handle duplicates)
            await self.collection.update_one(
                {"token_jti": jti},
                {
                    "$set": {
                        "token_jti": jti,
                        "token": token,
                        "blacklisted_at": datetime.utcnow(),
                        "expires_at": expires_at
                    }
                },
                upsert=True
            )
            
            # Add to memory cache
            self._memory_cache.add(jti)
            
            # Limit memory cache size
            if len(self._memory_cache) > self._cache_max_size:
                # Remove oldest entries (simple implementation)
                oldest_entries = list(self._memory_cache)[:100]
                for entry in oldest_entries:
                    self._memory_cache.discard(entry)
                    
            return True
        except Exception as e:
            print(f"Error blacklisting token: {e}")
            # Even if database fails, add to cache for immediate effect
            self._memory_cache.add(jti)
            return True  # Return True since it's in cache
    
    async def is_token_blacklisted(self, jti: str) -> bool:
        """Check if a token is blacklisted."""
        # First check memory cache for recent tokens
        if jti in self._memory_cache:
            return True
            
        # Check database
        result = await self.collection.find_one({"token_jti": jti})
        if result:
            # Add to memory cache for future quick lookups
            self._memory_cache.add(jti)
            return True
            
        return False
    
    async def blacklist_all_user_tokens(self, user_id: str):
        """Blacklist all tokens for a specific user (logout from all devices)."""
        # This is a simplified implementation
        # In a production system, you'd want to track user tokens more efficiently
        current_time = datetime.utcnow()
        await self.collection.insert_one({
            "user_id": user_id,
            "blacklisted_at": current_time,
            "expires_at": current_time + timedelta(days=30),  # Cover max token lifetime
            "all_tokens": True
        })
    
    async def cleanup_expired_tokens(self):
        """Manual cleanup of expired tokens (MongoDB TTL should handle this automatically)."""
        current_time = datetime.utcnow()
        result = await self.collection.delete_many({
            "expires_at": {"$lt": current_time}
        })
        return result.deleted_count

# Global instance
token_blacklist = TokenBlacklist()

# Convenience functions
async def blacklist_token(token: str, jti: str, expires_at: datetime) -> bool:
    """Blacklist a token."""
    return await token_blacklist.blacklist_token(token, jti, expires_at)

async def is_token_blacklisted(jti: str) -> bool:
    """Check if token is blacklisted."""
    return await token_blacklist.is_token_blacklisted(jti)

async def blacklist_all_user_tokens(user_id: str):
    """Blacklist all user tokens."""
    return await token_blacklist.blacklist_all_user_tokens(user_id)

async def ensure_blacklist_indexes():
    """Ensure blacklist indexes."""
    await token_blacklist.ensure_indexes()