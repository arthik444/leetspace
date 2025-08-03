from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import TokenData, UserInDB
# Use MongoDB for user operations
from db.user_operations import find_user_by_email
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token security
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    print(f"🔐 Creating token with SECRET_KEY: {SECRET_KEY[:20]}...")
    print(f"📋 Token data: {data}")
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    print(f"📋 Final payload: {to_encode}")
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"✅ Token created: {encoded_jwt[:50]}...")
    return encoded_jwt

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get user from temporary storage by email."""
    return await find_user_by_email(email)

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Authenticate a user with email and password."""
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        print(f"🔍 Verifying token: {token[:50]}...")
        print(f"🔑 Using SECRET_KEY: {SECRET_KEY[:20]}...")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"✅ Token decoded successfully: {payload}")
        
        email: str = payload.get("sub")
        if email is None:
            print("❌ No email in token payload")
            raise credentials_exception
        
        print(f"📧 Looking up user: {email}")
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"❌ JWT Error: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"❌ Unexpected error in token verification: {e}")
        raise credentials_exception
    
    user = await get_user_by_email(email=token_data.email)
    if user is None:
        print(f"❌ User not found: {token_data.email}")
        raise credentials_exception
    
    print(f"✅ User authenticated: {user.email}")
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user