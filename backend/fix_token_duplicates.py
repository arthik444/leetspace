#!/usr/bin/env python3
"""
Script to fix duplicate token issues in the blacklisted_tokens collection.
Run this once to clean up any problematic entries.
"""

import asyncio
from db.mongo import db

async def fix_token_duplicates():
    """Remove duplicate entries with null token_jti."""
    collection = db["blacklisted_tokens"]
    
    print("🔍 Checking for duplicate token entries...")
    
    # Remove all entries with null token_jti
    result = await collection.delete_many({"token_jti": None})
    print(f"🗑️ Removed {result.deleted_count} entries with null token_jti")
    
    # Remove all entries with empty string token_jti
    result = await collection.delete_many({"token_jti": ""})
    print(f"🗑️ Removed {result.deleted_count} entries with empty token_jti")
    
    # Count remaining entries
    count = await collection.count_documents({})
    print(f"📊 Remaining blacklisted tokens: {count}")
    
    print("✅ Token cleanup completed!")

if __name__ == "__main__":
    print("🚀 Starting token duplicate cleanup...")
    asyncio.run(fix_token_duplicates())
    print("🎉 Cleanup finished!")