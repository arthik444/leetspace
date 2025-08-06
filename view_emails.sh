#!/bin/bash

EMAIL_DIR="/workspace/emails"

echo "📧 LEETSPACE EMAILS"
echo "=================="

# Check if email directory exists
if [ ! -d "$EMAIL_DIR" ]; then
    echo "❌ Email directory not found: $EMAIL_DIR"
    echo "💡 Emails may not have been sent yet, or email service not configured"
    exit 1
fi

# Count emails
email_count=$(ls "$EMAIL_DIR"/*.txt 2>/dev/null | wc -l)
echo "📬 Total emails: $email_count"

if [ $email_count -eq 0 ]; then
    echo ""
    echo "📭 No emails found yet"
    echo "💡 Try registering a user or requesting password reset to generate emails"
    exit 0
fi

echo ""
echo "📨 Recent emails:"
echo "-----------------"
echo ""

# Show recent emails (last 5)
ls -t "$EMAIL_DIR"/*.txt 2>/dev/null | head -5 | while read file; do
    echo "📄 $(basename "$file")"
    echo "---"
    
    # Extract key info from email
    from=$(grep "^From:" "$file" 2>/dev/null || echo "From: Unknown")
    to=$(grep "^To:" "$file" 2>/dev/null || echo "To: Unknown")
    subject=$(grep "^Subject:" "$file" 2>/dev/null || echo "Subject: Unknown")
    date=$(grep "^Date:" "$file" 2>/dev/null || echo "Date: Unknown")
    
    echo "$from"
    echo "$to"
    echo "$subject"
    echo "$date"
    echo ""
    
    # Extract verification/reset links
    if grep -q "verify-email" "$file" 2>/dev/null; then
        link=$(grep "http.*verify-email" "$file" 2>/dev/null | head -1)
        echo "$link"
    elif grep -q "reset-password" "$file" 2>/dev/null; then
        link=$(grep "http.*reset-password" "$file" 2>/dev/null | head -1)
        echo "$link"
    fi
    
    echo ""
    echo ""
done

echo "📁 All emails saved in: $EMAIL_DIR/"
echo "🔍 To read full email: cat $EMAIL_DIR/[filename]"