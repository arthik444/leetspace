#!/usr/bin/env python3
"""
Debug script to test problem endpoints and diagnose issues
"""

import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000"

async def test_problems_debug():
    """Test problems endpoints step by step"""
    
    print("🔍 DEBUGGING PROBLEMS ENDPOINTS")
    print("=" * 50)
    
    # Step 1: Test server connection
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/auth/test") as resp:
                if resp.status == 200:
                    print("✅ Server is running")
                else:
                    print(f"❌ Server issue: {resp.status}")
                    return
        except Exception as e:
            print(f"❌ Cannot connect to server: {e}")
            return
        
        # Step 2: Try to login/register first
        print("\n📝 Testing Authentication...")
        
        # Register a test user
        register_data = {
            "email": "debug@test.com",
            "password": "debugpassword123",
            "full_name": "Debug User"
        }
        
        try:
            async with session.post(f"{BASE_URL}/api/auth/register", json=register_data) as resp:
                if resp.status == 200:
                    user_data = await resp.json()
                    print(f"✅ User registered: {user_data['email']}")
                elif resp.status == 400:
                    # User already exists, try to login
                    print("ℹ️ User already exists, attempting login...")
                else:
                    error_data = await resp.json()
                    print(f"❌ Registration failed: {resp.status} - {error_data}")
        except Exception as e:
            print(f"❌ Registration error: {e}")
        
        # Login
        login_data = {
            "email": "debug@test.com",
            "password": "debugpassword123"
        }
        
        token = None
        try:
            async with session.post(f"{BASE_URL}/api/auth/login/json", json=login_data) as resp:
                if resp.status == 200:
                    token_data = await resp.json()
                    token = token_data['access_token']
                    print(f"✅ Login successful")
                else:
                    error_data = await resp.json()
                    print(f"❌ Login failed: {resp.status} - {error_data}")
                    return
        except Exception as e:
            print(f"❌ Login error: {e}")
            return
        
        if not token:
            print("❌ No authentication token available")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 3: Test GET /api/problems/ (should work even with no problems)
        print("\n📚 Testing GET /api/problems/...")
        try:
            async with session.get(f"{BASE_URL}/api/problems/", headers=headers) as resp:
                print(f"Status: {resp.status}")
                if resp.status == 200:
                    problems = await resp.json()
                    print(f"✅ GET problems successful: {len(problems)} problems found")
                    return problems  # Return for further testing
                else:
                    error_text = await resp.text()
                    print(f"❌ GET problems failed: {resp.status}")
                    print(f"Error response: {error_text}")
                    return None
        except Exception as e:
            print(f"❌ GET problems exception: {e}")
            return None
        
        # Step 4: Test POST /api/problems/ (create a problem)
        print("\n➕ Testing POST /api/problems/...")
        problem_data = {
            "title": "Debug Test Problem",
            "url": "https://leetcode.com/problems/debug-test/",
            "difficulty": "Easy",
            "tags": ["Debug", "Test"],
            "date_solved": "2024-01-15",
            "notes": "Debug test problem",
            "retry_later": "No"
        }
        
        try:
            async with session.post(f"{BASE_URL}/api/problems/", json=problem_data, headers=headers) as resp:
                print(f"Status: {resp.status}")
                if resp.status == 200:
                    created_problem = await resp.json()
                    print(f"✅ POST problem successful: {created_problem['title']}")
                    return created_problem['id']
                else:
                    error_text = await resp.text()
                    print(f"❌ POST problem failed: {resp.status}")
                    print(f"Error response: {error_text}")
        except Exception as e:
            print(f"❌ POST problem exception: {e}")

async def main():
    await test_problems_debug()

if __name__ == "__main__":
    asyncio.run(main())