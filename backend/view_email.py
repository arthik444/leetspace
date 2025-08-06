#!/usr/bin/env python3
import os
import glob
from datetime import datetime
import html
import re

def view_emails():
    try:
        email_dir = '/leetspace/backend/emails'
        
        if not os.path.exists(email_dir):
            print('❌ Email directory not found')
            print('💡 Make sure email service is configured and emails have been sent')
            return
            
        # Get all email files
        email_files = glob.glob(os.path.join(email_dir, '*.txt'))
        
        if not email_files:
            print('📭 No emails found')
            print('💡 Try registering a user or requesting password reset to generate emails')
            return
            
        # Sort by modification time (newest first)
        email_files.sort(key=os.path.getmtime, reverse=True)
        
        print('📧 LEETSPACE EMAIL INBOX')
        print('=' * 60)
        print(f'📁 Found {len(email_files)} email(s)')
        print()
        
        for i, email_file in enumerate(email_files, 1):
            filename = os.path.basename(email_file)
            print(f'📨 EMAIL #{i} - {filename}')
            
            try:
                with open(email_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Parse email content
                lines = content.split('\n')
                from_email = 'Unknown'
                to_email = 'Unknown'
                subject = 'Unknown'
                date_str = 'Unknown'
                
                for line in lines:
                    if line.startswith('From: '):
                        from_email = line[6:].strip()
                    elif line.startswith('To: '):
                        to_email = line[4:].strip()
                    elif line.startswith('Subject: '):
                        subject = line[9:].strip()
                    elif line.startswith('Date: '):
                        date_str = line[6:].strip()
                
                print(f'Subject: {subject}')
                print(f'From: {from_email}')
                print(f'To: {to_email}')
                print(f'Date: {date_str}')
                print('-' * 40)
                
                # Extract and display content
                if '=== TEXT CONTENT ===' in content:
                    text_start = content.find('=== TEXT CONTENT ===')
                    html_start = content.find('=== HTML CONTENT ===')
                    
                    if text_start != -1:
                        text_end = html_start if html_start != -1 else content.find('=== END EMAIL ===')
                        text_content = content[text_start + len('=== TEXT CONTENT ==='):text_end].strip()
                        
                        if text_content and text_content != 'No text content':
                            print('📄 Email Content (Text):')
                            print(text_content[:500] + '...' if len(text_content) > 500 else text_content)
                        elif html_start != -1:
                            html_end = content.find('=== END EMAIL ===')
                            html_content = content[html_start + len('=== HTML CONTENT ==='):html_end].strip()
                            
                            print('📄 Email Content (HTML):')
                            # Simple HTML tag removal for readability
                            text_from_html = re.sub('<[^<]+?>', '', html_content)
                            text_from_html = html.unescape(text_from_html)
                            text_from_html = re.sub(r'\s+', ' ', text_from_html).strip()
                            
                            print(text_from_html[:500] + '...' if len(text_from_html) > 500 else text_from_html)
                        
                        # Extract verification/reset links
                        if 'verify-email' in content:
                            match = re.search(r'http://[^\s]+verify-email[^\s]*', content)
                            if match:
                                print(f'\n🔗 Verification Link: {match.group()}')
                        elif 'reset-password' in content:
                            match = re.search(r'http://[^\s]+reset-password[^\s]*', content)
                            if match:
                                print(f'\n🔗 Reset Link: {match.group()}')
                
            except Exception as file_error:
                print(f'❌ Error reading {filename}: {file_error}')
            
            print('=' * 60)
            print()
            
    except Exception as e:
        print(f'❌ Error accessing emails: {e}')
        print('💡 Make sure the email service is properly configured')

if __name__ == '__main__':
    view_emails()