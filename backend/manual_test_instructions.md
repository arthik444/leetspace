# Manual Testing Instructions for LeetSpace API

## Prerequisites
1. Start your server: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. Server should be running on `http://localhost:8000`

## 🔐 Authentication Tests

### 1. Test Server Status
```bash
curl -X GET "http://localhost:8000/api/auth/test"
```
**Expected**: `{"message": "✅ Authentication system is working!", "timestamp": "..."}`

### 2. Register a New User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
  }'
```
**Expected**: User object with id, email, full_name, created_at, updated_at

### 3. Login User
```bash
curl -X POST "http://localhost:8000/api/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpassword123"
  }'
```
**Expected**: `{"access_token": "...", "token_type": "bearer"}`

**📝 IMPORTANT: Copy the access_token from the response for the next tests!**

### 4. Verify Token
```bash
# Replace YOUR_TOKEN with the actual token from step 3
curl -X GET "http://localhost:8000/api/auth/verify" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"valid": true, "user": {...}}`

### 5. Get Current User Profile
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: User profile object

## 📚 Problems Tests

### 6. Create a Problem
```bash
curl -X POST "http://localhost:8000/api/problems/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Two Sum",
    "url": "https://leetcode.com/problems/two-sum/",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "date_solved": "2024-01-15",
    "notes": "Used hashmap for O(n) solution",
    "retry_later": "No"
  }'
```
**Expected**: Problem object with id

**📝 IMPORTANT: Copy the problem id from the response for the next tests!**

### 7. Get All Problems
```bash
curl -X GET "http://localhost:8000/api/problems/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Array of problems for the authenticated user

### 8. Get Specific Problem
```bash
# Replace PROBLEM_ID with the actual problem id from step 6
curl -X GET "http://localhost:8000/api/problems/PROBLEM_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Specific problem object

### 9. Update Problem
```bash
curl -X PUT "http://localhost:8000/api/problems/PROBLEM_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "notes": "Updated: Used hashmap for O(n) solution with space optimization"
  }'
```
**Expected**: Updated problem object

### 10. Get Problem Statistics
```bash
curl -X GET "http://localhost:8000/api/problems/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Statistics object with total_solved, by_difficulty, etc.

## 📊 Analytics Tests

### 11. Get Analytics Dashboard
```bash
curl -X GET "http://localhost:8000/api/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Dashboard object with basic_stats, weaknesses, activity_heatmap, etc.

## 🧹 Cleanup (Optional)

### 12. Delete Test Problem
```bash
curl -X DELETE "http://localhost:8000/api/problems/PROBLEM_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"detail": "Problem deleted successfully"}`

## ✅ Success Criteria

All endpoints should return:
- ✅ **200 status codes** for successful operations
- ✅ **Proper JSON responses** with expected data structure
- ✅ **Authentication required** for protected endpoints (401 without token)
- ✅ **User data isolation** (users can only see their own problems)

## ❌ Common Issues

1. **503 errors**: MongoDB connection issues
2. **401 errors**: Invalid or missing authentication token
3. **404 errors**: Invalid problem IDs or user trying to access other user's data
4. **400 errors**: Invalid request data or duplicate emails

## 🚀 Automated Testing

For automated testing, install aiohttp and run:
```bash
pip install aiohttp
python test_all_endpoints.py
```

This will test all endpoints automatically and provide a comprehensive report.