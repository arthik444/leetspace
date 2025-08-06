import os
import logging
from typing import Optional, Dict
import json
import jwt
from jwt import PyJWKClient
import httpx

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    """Service for handling Google OAuth authentication"""
    
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
        
        if not self.client_id:
            logger.warning("GOOGLE_CLIENT_ID not set - Google OAuth will not work")
    
    async def verify_google_token(self, credential: str) -> Optional[Dict]:
        """
        Verify Google JWT token and extract user information.
        
        Args:
            credential: Google JWT token from frontend
            
        Returns:
            Dict with user info if valid, None if invalid
        """
        if not self.client_id:
            logger.error("Google OAuth not configured - missing GOOGLE_CLIENT_ID")
            return None
        
        try:
            # Get Google's public keys
            jwks_client = PyJWKClient(self.jwks_url)
            
            # Get the signing key from JWT header
            signing_key = jwks_client.get_signing_key_from_jwt(credential)
            
            # Decode and verify the JWT
            payload = jwt.decode(
                credential,
                signing_key.key,
                algorithms=["RS256"],
                audience=self.client_id,
                issuer="https://accounts.google.com"
            )
            
            # Extract user information
            user_info = {
                "google_id": payload.get("sub"),
                "email": payload.get("email"),
                "email_verified": payload.get("email_verified", False),
                "name": payload.get("name"),
                "given_name": payload.get("given_name"),
                "family_name": payload.get("family_name"),
                "picture": payload.get("picture"),
                "locale": payload.get("locale")
            }
            
            # Validate required fields
            if not user_info["google_id"] or not user_info["email"]:
                logger.error("Google token missing required fields")
                return None
            
            logger.info(f"Successfully verified Google token for user: {user_info['email']}")
            return user_info
            
        except jwt.ExpiredSignatureError:
            logger.error("Google token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid Google token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Google token: {str(e)}")
            return None
    
    async def get_user_info_from_token(self, access_token: str) -> Optional[Dict]:
        """
        Get user info from Google using access token (alternative method).
        
        Args:
            access_token: Google access token
            
        Returns:
            Dict with user info if successful, None if failed
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    
                    user_info = {
                        "google_id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "email_verified": user_data.get("verified_email", False),
                        "name": user_data.get("name"),
                        "given_name": user_data.get("given_name"),
                        "family_name": user_data.get("family_name"),
                        "picture": user_data.get("picture"),
                        "locale": user_data.get("locale")
                    }
                    
                    logger.info(f"Successfully got user info from Google for: {user_info['email']}")
                    return user_info
                else:
                    logger.error(f"Google API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting user info from Google: {str(e)}")
            return None
    
    def is_configured(self) -> bool:
        """Check if Google OAuth is properly configured."""
        return bool(self.client_id)

# Create singleton instance
google_oauth_service = GoogleOAuthService()