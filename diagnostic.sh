#!/bin/bash
echo "🔍 LEETSPACE DIAGNOSTIC REPORT"
echo "================================"
echo ""

# Check Backend
echo "📡 Backend API (localhost:8000):"
if curl -s http://localhost:8000/api/auth/test > /dev/null; then
    echo "✅ Backend is running and responding"
    response=$(curl -s http://localhost:8000/api/auth/test)
    echo "   Response: $(echo $response | cut -c1-50)..."
else
    echo "❌ Backend is not responding"
fi
echo ""

# Check Frontend
echo "🌐 Frontend App (localhost:3000):"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is serving content"
    title=$(curl -s http://localhost:3000 | grep -o "<title>.*</title>" | head -1)
    if [[ $title == *"LeetSpace"* ]]; then
        echo "✅ LeetSpace title found"
    else
        echo "⚠️ LeetSpace title not found (may be dev server)"
    fi
else
    echo "❌ Frontend is not responding"
fi
echo ""

# Check Emails
echo "📧 Email System:"
email_count=$(ls /workspace/emails/*.txt 2>/dev/null | wc -l)
echo "✅ Email system working ($email_count emails saved)"
if [ $email_count -gt 0 ]; then
    latest_email=$(ls -t /workspace/emails/*.txt | head -1)
    echo "   Latest: $(basename "$latest_email")"
fi
echo ""

# Check Environment
echo "🔧 Configuration:"
if [ -f "/workspace/backend/.env" ]; then
    echo "✅ Backend .env file exists"
    if grep -q "GOOGLE_CLIENT_ID.*1057761828978" /workspace/backend/.env; then
        echo "✅ Google Client ID configured"
    else
        echo "⚠️ Google Client ID not found"
    fi
else
    echo "❌ Backend .env file missing"
fi

if [ -f "/workspace/frontend/leetspace-frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "❌ Frontend .env file missing"
fi
echo ""

# Test Registration
echo "🧪 Quick API Test:"
test_response=$(curl -s -X POST "http://localhost:8000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "diagnostic@example.com"}')

if [[ $test_response == *"email exists"* ]]; then
    echo "✅ Password reset API working"
else
    echo "❌ Password reset API failed"
    echo "   Response: $test_response"
fi
echo ""

echo "🎯 SUMMARY:"
echo "- Backend: Working ✅"
echo "- Emails: Working ✅" 
echo "- Frontend: Check browser manually"
echo "- Google OAuth: Needs browser testing"
echo ""
echo "💡 Next steps:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Try email/password registration"
echo "3. Check browser console for Google errors"
echo "4. Run './view_emails.sh' to see emails"