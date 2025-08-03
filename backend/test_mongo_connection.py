#!/usr/bin/env python3
"""
MongoDB Atlas Connection Test Script
Run this to verify your Atlas connection is working
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_mongodb_connection():
    """Test MongoDB Atlas connection"""
    load_dotenv()
    
    mongo_uri = os.getenv("MONGO_URI")
    print(f"Testing MongoDB connection...")
    print(f"URI: {mongo_uri[:50]}..." if mongo_uri else "No MONGO_URI found in .env")
    
    if not mongo_uri:
        print("❌ MONGO_URI not found in .env file")
        return False
    
    try:
        # Create client
        client = AsyncIOMotorClient(mongo_uri)
        
        # Test connection
        print("🔄 Attempting to connect to MongoDB Atlas...")
        await client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful!")
        
        # Test database access
        db = client["leetspace"]
        collections = await db.list_collection_names()
        print(f"📊 Available collections: {collections}")
        
        # Test user collection operations
        users_collection = db["users"]
        user_count = await users_collection.count_documents({})
        print(f"👥 Current user count: {user_count}")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n🔧 Common solutions:")
        print("1. Check your username and password in the connection string")
        print("2. Ensure your IP address is whitelisted in Atlas (use 0.0.0.0/0 for testing)")
        print("3. Verify your cluster is running and accessible")
        print("4. Check if your database user has proper permissions")
        return False

if __name__ == "__main__":
    asyncio.run(test_mongodb_connection())