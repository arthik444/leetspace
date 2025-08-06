#!/bin/bash
echo "📧 CHECKING LEETSPACE EMAILS..."
echo "================================"

# Check if MailHog is running
if ! curl -s http://localhost:8025/api/v2/messages > /dev/null; then
    echo "❌ MailHog not accessible"
    exit 1
fi

# Get email count
email_count=$(curl -s http://localhost:8025/api/v2/messages | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(len(data.get('items', [])))
except:
    print(0)
")

echo "📬 Total emails: $email_count"

if [ "$email_count" -gt 0 ]; then
    echo ""
    echo "📨 Recent emails:"
    echo "-----------------"
    
    # Show recent emails
    curl -s http://localhost:8025/api/v2/messages | python3 -c "
import sys, json, base64

try:
    data = json.load(sys.stdin)
    messages = data.get('items', [])
    
    for i, msg in enumerate(messages[:3], 1):  # Show last 3 emails
        subject = msg.get('Content', {}).get('Headers', {}).get('Subject', ['No Subject'])[0]
        to_info = msg.get('To', [{}])[0]
        to_email = f\"{to_info.get('Mailbox', 'unknown')}@{to_info.get('Domain', 'unknown')}\"
        created = msg.get('Created', 'Unknown')
        
        print(f'{i}. {subject}')
        print(f'   To: {to_email}')
        print(f'   Time: {created[:19]}')
        print()
        
except Exception as e:
    print(f'Error: {e}')
"
else
    echo "📭 No emails found"
fi

echo ""
echo "💡 To test email sending:"
echo "curl -X POST 'http://localhost:8000/api/auth/forgot-password' -H 'Content-Type: application/json' -d '{\"email\": \"test@example.com\"}'"