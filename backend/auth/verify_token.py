import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
from config import settings

# Initialize Firebase Admin SDK
firebase_initialized = False
try:
    # For development, we'll use the Firebase project ID only
    # In production, you should use a service account key file
    if not firebase_admin._apps and settings.firebase_project_id:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            # Note: In production, add all required fields from service account JSON
        })
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
except Exception as e:
    logging.warning(f"Firebase initialization failed: {e}")
    logging.info("Firebase features will be disabled - using mock authentication for development")

# HTTP Bearer security scheme
security = HTTPBearer()

class FirebaseAuth:
    @staticmethod
    async def verify_firebase_token(token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token and return user claims
        """
        # For development, if Firebase is not initialized, use mock authentication
        if not firebase_initialized:
            logging.warning("Using mock authentication - Firebase not initialized")
            return {
                "uid": "dev-user-123",
                "email": "dev@example.com",
                "email_verified": True,
                "name": "Development User"
            }
        
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            return decoded_token
        except firebase_auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except firebase_auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logging.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

# Dependency for getting current user from Firebase token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    FastAPI dependency to get current authenticated user
    """
    token = credentials.credentials
    user_claims = await FirebaseAuth.verify_firebase_token(token)
    return user_claims

# Optional auth dependency (doesn't raise error if no token)
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to optionally get current authenticated user
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        user_claims = await FirebaseAuth.verify_firebase_token(token)
        return user_claims
    except HTTPException:
        return None