#!/usr/bin/env python3
"""
Production Email Viewer for MailHog SMTP Server
Displays emails in a clean, readable format with proper error handling
"""

import requests
import json
import base64
import html
import re
from datetime import datetime
from typing import List, Dict, Any

class ProductionEmailViewer:
    def __init__(self, mailhog_url: str = "http://localhost:8025"):
        self.mailhog_url = mailhog_url
        self.api_url = f"{mailhog_url}/api/v2"
    
    def fetch_emails(self) -> List[Dict[str, Any]]:
        """Fetch emails from MailHog API"""
        try:
            response = requests.get(f"{self.api_url}/messages", timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('items', [])
        except requests.RequestException as e:
            print(f"❌ Error connecting to MailHog: {e}")
            print(f"   Make sure MailHog is running on {self.mailhog_url}")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing MailHog response: {e}")
            return []
    
    def decode_content(self, content: str, encoding: str = "base64") -> str:
        """Decode email content"""
        try:
            if encoding.lower() == "base64":
                decoded_bytes = base64.b64decode(content)
                return decoded_bytes.decode('utf-8', errors='ignore')
            return content
        except Exception as e:
            print(f"⚠️ Could not decode content: {e}")
            return content
    
    def extract_text_from_html(self, html_content: str) -> str:
        """Extract readable text from HTML content"""
        # Remove script and style elements
        html_content = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', html_content)
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_links(self, content: str) -> List[str]:
        """Extract verification/reset links from email content"""
        # Look for verification and reset links
        patterns = [
            r'http[s]?://[^\s]+verify-email[^\s]*',
            r'http[s]?://[^\s]+reset-password[^\s]*',
            r'http[s]?://[^\s]+/verify[^\s]*',
            r'http[s]?://[^\s]+/reset[^\s]*'
        ]
        
        links = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            links.extend(matches)
        
        return list(set(links))  # Remove duplicates
    
    def parse_email_content(self, message: Dict[str, Any]) -> Dict[str, str]:
        """Parse email content from MailHog message"""
        result = {
            'text_content': '',
            'html_content': '',
            'links': []
        }
        
        try:
            # Get MIME parts
            mime_parts = message.get('MIME', {}).get('Parts', [])
            
            for part in mime_parts:
                content_type = part.get('Headers', {}).get('Content-Type', [''])[0]
                body = part.get('Body', '')
                encoding = part.get('Headers', {}).get('Content-Transfer-Encoding', [''])[0]
                
                if 'text/plain' in content_type:
                    result['text_content'] = self.decode_content(body, encoding)
                elif 'text/html' in content_type:
                    result['html_content'] = self.decode_content(body, encoding)
            
            # Extract links from both text and HTML content
            all_content = result['text_content'] + ' ' + result['html_content']
            result['links'] = self.extract_links(all_content)
            
        except Exception as e:
            print(f"⚠️ Error parsing email content: {e}")
        
        return result
    
    def format_datetime(self, iso_string: str) -> str:
        """Format ISO datetime string to readable format"""
        try:
            dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
            return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
        except Exception:
            return iso_string
    
    def display_emails(self):
        """Display all emails in a formatted way"""
        emails = self.fetch_emails()
        
        if not emails:
            print("📭 No emails found in MailHog")
            print("💡 Try registering a user or requesting password reset to generate emails")
            return
        
        print("📧 LEETSPACE EMAIL INBOX (Production SMTP)")
        print("=" * 70)
        print(f"📬 Total emails: {len(emails)}")
        print(f"🌐 MailHog Web UI: {self.mailhog_url}")
        print()
        
        for i, email in enumerate(emails, 1):
            try:
                # Extract basic email info
                headers = email.get('Content', {}).get('Headers', {})
                subject = headers.get('Subject', ['No Subject'])[0]
                from_email = headers.get('From', ['Unknown'])[0]
                to_emails = headers.get('To', ['Unknown'])
                created = email.get('Created', '')
                
                print(f"📨 EMAIL #{i}")
                print(f"Subject: {subject}")
                print(f"From: {from_email}")
                print(f"To: {', '.join(to_emails)}")
                print(f"Date: {self.format_datetime(created)}")
                print("-" * 50)
                
                # Parse email content
                content = self.parse_email_content(email)
                
                # Display text content
                if content['text_content']:
                    text = content['text_content']
                    print("📄 Email Content:")
                    # Show first 400 characters
                    if len(text) > 400:
                        print(f"{text[:400]}...")
                    else:
                        print(text)
                elif content['html_content']:
                    # Fall back to HTML content if no text
                    html_text = self.extract_text_from_html(content['html_content'])
                    print("📄 Email Content (from HTML):")
                    if len(html_text) > 400:
                        print(f"{html_text[:400]}...")
                    else:
                        print(html_text)
                
                # Display action links
                if content['links']:
                    print()
                    for link in content['links']:
                        if 'verify' in link.lower():
                            print(f"🔗 Verification Link: {link}")
                        elif 'reset' in link.lower():
                            print(f"🔗 Reset Link: {link}")
                        else:
                            print(f"🔗 Link: {link}")
                
                print("=" * 70)
                print()
                
            except Exception as e:
                print(f"❌ Error processing email #{i}: {e}")
                print("=" * 70)
                print()
    
    def check_system_status(self):
        """Check if MailHog is accessible"""
        try:
            response = requests.get(f"{self.api_url}/messages", timeout=5)
            response.raise_for_status()
            data = response.json()
            total = data.get('total', 0)
            
            print(f"✅ MailHog is running on {self.mailhog_url}")
            print(f"📧 Total emails: {total}")
            print(f"🌐 Web interface: {self.mailhog_url}")
            return True
        except Exception as e:
            print(f"❌ MailHog not accessible: {e}")
            print(f"💡 Make sure MailHog is running: ./mailhog")
            return False

def main():
    viewer = ProductionEmailViewer()
    
    print("🚀 LeetSpace Production Email Viewer")
    print("-" * 40)
    
    if not viewer.check_system_status():
        return
    
    print()
    viewer.display_emails()
    
    print("💡 To view emails in web browser, visit: http://localhost:8025")
    print("🔄 To refresh emails, run this script again")

if __name__ == "__main__":
    main()