# auth/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from auth.firebase_auth_dev import verify_firebase_token

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get the current authenticated user from Firebase ID token
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify Firebase ID token and get user info
    user_info = await verify_firebase_token(credentials.credentials)
    
    # Check if email is verified (disabled for development)
    # Uncomment the lines below if you want to require email verification
    if not user_info.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified. Please verify your email address.",
        )
    
    return user_info

async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to get the current active user (same as get_current_user for Firebase)
    """
    return current_user

async def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """
    Optional dependency to get current user (for endpoints that can work with or without auth)
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None