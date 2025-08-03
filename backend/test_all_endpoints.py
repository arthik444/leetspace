#!/usr/bin/env python3
"""
Comprehensive Test Script for All LeetSpace API Endpoints
Tests authentication, problems, and analytics endpoints
"""

import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

class LeetSpaceAPITester:
    def __init__(self):
        self.session = None
        self.token = None
        self.user_id = None
        self.problem_id = None
    
    async def setup_session(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_auth_endpoints(self):
        """Test all authentication endpoints"""
        print("\n🔐 TESTING AUTHENTICATION ENDPOINTS")
        print("=" * 50)
        
        # Test server status
        try:
            async with self.session.get(f"{BASE_URL}/api/auth/test") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Server Status: {data['message']}")
                else:
                    print(f"❌ Server Status: {resp.status}")
        except Exception as e:
            print(f"❌ Server connection failed: {e}")
            return False
        
        # Test user registration
        test_email = f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
        register_data = {
            "email": test_email,
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        try:
            async with self.session.post(
                f"{BASE_URL}/api/auth/register",
                json=register_data
            ) as resp:
                if resp.status == 200:
                    user_data = await resp.json()
                    print(f"✅ User Registration: {user_data['email']}")
                    self.user_id = user_data['id']
                else:
                    error_data = await resp.json()
                    print(f"❌ User Registration: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Registration failed: {e}")
            return False
        
        # Test user login
        login_data = {
            "email": test_email,
            "password": "testpassword123"
        }
        
        try:
            async with self.session.post(
                f"{BASE_URL}/api/auth/login/json",
                json=login_data
            ) as resp:
                if resp.status == 200:
                    token_data = await resp.json()
                    self.token = token_data['access_token']
                    print(f"✅ User Login: Token received")
                else:
                    error_data = await resp.json()
                    print(f"❌ User Login: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
        
        # Test token verification
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            async with self.session.get(
                f"{BASE_URL}/api/auth/verify",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    verify_data = await resp.json()
                    print(f"✅ Token Verification: {verify_data['user']['email']}")
                else:
                    error_data = await resp.json()
                    print(f"❌ Token Verification: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Token verification failed: {e}")
            return False
        
        # Test get current user
        try:
            async with self.session.get(
                f"{BASE_URL}/api/auth/me",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    user_data = await resp.json()
                    print(f"✅ Get Current User: {user_data['email']}")
                else:
                    error_data = await resp.json()
                    print(f"❌ Get Current User: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Get current user failed: {e}")
            return False
        
        return True
    
    async def test_problem_endpoints(self):
        """Test all problem endpoints"""
        print("\n📚 TESTING PROBLEM ENDPOINTS")
        print("=" * 50)
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test create problem
        problem_data = {
            "title": "Two Sum",
            "url": "https://leetcode.com/problems/two-sum/",
            "difficulty": "Easy",
            "tags": ["Array", "Hash Table"],
            "date_solved": "2024-01-15",
            "notes": "Used hashmap for O(n) solution",
            "retry_later": "No"
        }
        
        try:
            async with self.session.post(
                f"{BASE_URL}/api/problems/",
                json=problem_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    created_problem = await resp.json()
                    self.problem_id = created_problem['id']
                    print(f"✅ Create Problem: {created_problem['title']}")
                else:
                    error_data = await resp.json()
                    print(f"❌ Create Problem: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Create problem failed: {e}")
            return False
        
        # Test get all problems
        try:
            async with self.session.get(
                f"{BASE_URL}/api/problems/",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    problems = await resp.json()
                    print(f"✅ Get All Problems: {len(problems)} problems found")
                else:
                    error_data = await resp.json()
                    print(f"❌ Get All Problems: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Get all problems failed: {e}")
            return False
        
        # Test get specific problem
        if self.problem_id:
            try:
                async with self.session.get(
                    f"{BASE_URL}/api/problems/{self.problem_id}",
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        problem = await resp.json()
                        print(f"✅ Get Specific Problem: {problem['title']}")
                    else:
                        error_data = await resp.json()
                        print(f"❌ Get Specific Problem: {resp.status} - {error_data}")
                        return False
            except Exception as e:
                print(f"❌ Get specific problem failed: {e}")
                return False
        
        # Test update problem
        if self.problem_id:
            update_data = {
                "notes": "Updated: Used hashmap for O(n) solution with optimization"
            }
            try:
                async with self.session.put(
                    f"{BASE_URL}/api/problems/{self.problem_id}",
                    json=update_data,
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        updated_problem = await resp.json()
                        print(f"✅ Update Problem: {updated_problem['title']}")
                    else:
                        error_data = await resp.json()
                        print(f"❌ Update Problem: {resp.status} - {error_data}")
                        return False
            except Exception as e:
                print(f"❌ Update problem failed: {e}")
                return False
        
        # Test get problem stats
        try:
            async with self.session.get(
                f"{BASE_URL}/api/problems/stats",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    stats = await resp.json()
                    print(f"✅ Get Problem Stats: {stats['total_solved']} problems solved")
                else:
                    error_data = await resp.json()
                    print(f"❌ Get Problem Stats: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Get problem stats failed: {e}")
            return False
        
        return True
    
    async def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n📊 TESTING ANALYTICS ENDPOINTS")
        print("=" * 50)
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test dashboard analytics
        try:
            async with self.session.get(
                f"{BASE_URL}/api/analytics/dashboard",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    dashboard = await resp.json()
                    basic_stats = dashboard.get('basic_stats', {})
                    total_problems = basic_stats.get('total_problems', 0)
                    print(f"✅ Analytics Dashboard: {total_problems} problems analyzed")
                else:
                    error_data = await resp.json()
                    print(f"❌ Analytics Dashboard: {resp.status} - {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Analytics dashboard failed: {e}")
            return False
        
        return True
    
    async def test_cleanup(self):
        """Cleanup test data"""
        print("\n🧹 CLEANING UP TEST DATA")
        print("=" * 50)
        
        if not self.token or not self.problem_id:
            print("❌ No test data to cleanup")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Delete test problem
        try:
            async with self.session.delete(
                f"{BASE_URL}/api/problems/{self.problem_id}",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    print("✅ Test problem deleted successfully")
                else:
                    print(f"⚠️ Problem deletion: {resp.status}")
        except Exception as e:
            print(f"⚠️ Problem deletion failed: {e}")
    
    async def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 LEETSPACE API COMPREHENSIVE TEST SUITE")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Test all endpoints
            auth_success = await self.test_auth_endpoints()
            if not auth_success:
                print("\n❌ Authentication tests failed. Stopping.")
                return False
            
            problems_success = await self.test_problem_endpoints()
            if not problems_success:
                print("\n❌ Problems tests failed.")
                return False
            
            analytics_success = await self.test_analytics_endpoints()
            if not analytics_success:
                print("\n❌ Analytics tests failed.")
                return False
            
            # Cleanup
            await self.test_cleanup()
            
            print(f"\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
            print("✅ Authentication: Working")
            print("✅ Problems: Working") 
            print("✅ Analytics: Working")
            return True
            
        except Exception as e:
            print(f"\n❌ Test suite failed: {e}")
            return False
        finally:
            await self.cleanup_session()

async def main():
    """Main test function"""
    tester = LeetSpaceAPITester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n🎯 API is ready for production!")
    else:
        print("\n⚠️ API has issues that need to be resolved.")

if __name__ == "__main__":
    asyncio.run(main())