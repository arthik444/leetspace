#!/usr/bin/env python3
"""
Debug JWT token validation
"""

import jwt
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def debug_token(token_string):
    """Debug a JWT token"""
    print("🔍 JWT TOKEN DEBUGGING")
    print("=" * 50)
    
    # Remove 'Bearer ' prefix if present
    if token_string.startswith('Bearer '):
        token_string = token_string[7:]
    
    print(f"Token (first 50 chars): {token_string[:50]}...")
    
    try:
        # Decode without verification first to see the payload
        unverified_payload = jwt.decode(token_string, options={"verify_signature": False})
        print(f"✅ Token structure is valid")
        print(f"📋 Payload: {unverified_payload}")
        
        # Check expiration
        exp = unverified_payload.get('exp')
        if exp:
            exp_time = datetime.fromtimestamp(exp)
            current_time = datetime.now()
            print(f"⏰ Token expires at: {exp_time}")
            print(f"⏰ Current time: {current_time}")
            
            if current_time > exp_time:
                print("❌ TOKEN HAS EXPIRED!")
                return False
            else:
                print(f"✅ Token is still valid for {exp_time - current_time}")
        
        # Now try to verify with the secret
        secret_key = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production-12345")
        print(f"🔑 Using secret key: {secret_key[:20]}...")
        
        try:
            verified_payload = jwt.decode(token_string, secret_key, algorithms=["HS256"])
            print("✅ Token signature is valid!")
            print(f"📋 Verified payload: {verified_payload}")
            return True
        except jwt.InvalidSignatureError:
            print("❌ Invalid token signature!")
            return False
        except jwt.ExpiredSignatureError:
            print("❌ Token has expired!")
            return False
        except Exception as e:
            print(f"❌ Token verification failed: {e}")
            return False
            
    except jwt.DecodeError:
        print("❌ Invalid token format!")
        return False
    except Exception as e:
        print(f"❌ Token debugging failed: {e}")
        return False

if __name__ == "__main__":
    # Test with your token
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzU0MjMzODQ1fQ.NQbtGkBVislqTu2_WmbTB0o1kbOGu7ShyDV-QlaKsY4"
    debug_token(token)