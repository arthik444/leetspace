#!/bin/bash

# Test script for problems endpoints debugging

BASE_URL="http://localhost:8000"

echo "🔍 DEBUGGING PROBLEMS ENDPOINTS WITH CURL"
echo "=========================================="

# Step 1: Test server
echo ""
echo "1️⃣ Testing server connection..."
curl -s -X GET "$BASE_URL/api/auth/test" | jq '.' || echo "❌ Server not responding"

# Step 2: Register/Login
echo ""
echo "2️⃣ Registering/Login user..."

# Try to register
echo "Registering user..."
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcurl@example.com",
    "password": "testpassword123",
    "full_name": "Test Curl User"
  }' | jq '.' || echo "Registration may have failed (user might exist)"

# Login to get token
echo ""
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcurl@example.com",
    "password": "testpassword123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    echo "Login response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Step 3: Test GET problems
echo ""
echo "3️⃣ Testing GET /api/problems/..."
curl -s -X GET "$BASE_URL/api/problems/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.' || echo "Failed to parse JSON response"

# Step 4: Test POST problem
echo ""
echo "4️⃣ Testing POST /api/problems/..."
curl -s -X POST "$BASE_URL/api/problems/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curl Test Problem",
    "url": "https://leetcode.com/problems/curl-test/",
    "difficulty": "Easy",
    "tags": ["Test", "Curl"],
    "date_solved": "2024-01-15",
    "notes": "Test problem created via curl",
    "retry_later": "No"
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.' || echo "Failed to parse JSON response"

# Step 5: Test GET problems again
echo ""
echo "5️⃣ Testing GET /api/problems/ again..."
curl -s -X GET "$BASE_URL/api/problems/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.' || echo "Failed to parse JSON response"

echo ""
echo "🏁 Test completed!"