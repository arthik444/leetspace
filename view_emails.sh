#!/bin/bash
echo "📧 LEETSPACE EMAILS"
echo "=================="

if [ ! -d "/workspace/emails" ]; then
    echo "❌ No emails directory found"
    exit 1
fi

email_count=$(ls /workspace/emails/*.txt 2>/dev/null | wc -l)
echo "📬 Total emails: $email_count"
echo ""

if [ $email_count -eq 0 ]; then
    echo "📭 No emails found"
    echo ""
    echo "💡 To generate test emails:"
    echo "curl -X POST 'http://localhost:8000/api/auth/forgot-password' -H 'Content-Type: application/json' -d '{\"email\": \"test@example.com\"}'"
else
    echo "📨 Recent emails:"
    echo "-----------------"
    
    # Show latest 3 emails
    ls -t /workspace/emails/*.txt | head -3 | while read file; do
        echo ""
        echo "📄 $(basename "$file")"
        echo "---"
        # Show just the header info
        grep -A 10 "=== EMAIL MESSAGE ===" "$file" | grep -E "(From:|To:|Subject:|Date:)" 
        echo ""
        # Show verification/reset links
        grep -o "http://[^[:space:]]*" "$file" | head -1
        echo ""
    done
fi

echo ""
echo "📁 All emails saved in: /workspace/emails/"
echo "🔍 To read full email: cat /workspace/emails/[filename]"