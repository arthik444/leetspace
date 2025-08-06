#!/usr/bin/env python3
import requests
import json
from datetime import datetime
import html

def view_emails():
    try:
        response = requests.get('http://localhost:8025/api/v2/messages')
        data = response.json()
        messages = data.get('items', [])
        
        print('📧 LEETSPACE EMAIL INBOX')
        print('=' * 60)
        
        if not messages:
            print('📭 No emails found')
            return
            
        for i, msg in enumerate(messages, 1):
            # Get email details
            subject = msg.get('Content', {}).get('Headers', {}).get('Subject', ['No Subject'])[0]
            to_info = msg.get('To', [{}])[0]
            to_email = f"{to_info.get('Mailbox', 'unknown')}@{to_info.get('Domain', 'unknown')}"
            from_info = msg.get('From', {})
            from_email = f"{from_info.get('Mailbox', 'unknown')}@{from_info.get('Domain', 'unknown')}"
            created = msg.get('Created', '')
            
            # Format date
            if created:
                try:
                    dt = datetime.fromisoformat(created.replace('Z', '+00:00'))
                    date_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    date_str = created
            else:
                date_str = 'Unknown'
            
            print(f'\n📨 EMAIL #{i}')
            print(f'Subject: {subject}')
            print(f'From: {from_email}')
            print(f'To: {to_email}')
            print(f'Date: {date_str}')
            print('-' * 40)
            
            # Get email body
            body = msg.get('Content', {}).get('Body', '')
            if body:
                # Try to extract readable content
                if 'html' in body.lower():
                    print('📄 Email Content (HTML):')
                    # Simple HTML tag removal for readability
                    import re
                    text_content = re.sub('<[^<]+?>', '', body)
                    text_content = html.unescape(text_content)
                    # Show first 300 characters
                    print(text_content[:300] + '...' if len(text_content) > 300 else text_content)
                else:
                    print('📄 Email Content:')
                    print(body[:300] + '...' if len(body) > 300 else body)
            
            print('=' * 60)
            
    except Exception as e:
        print(f'❌ Error fetching emails: {e}')

if __name__ == '__main__':
    view_emails()