from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import UserCreate, User, UserInDB, Token
from auth.verify_token import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    get_current_active_user,
    get_user_by_email,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
# Use MongoDB for user operations
from db.user_operations import create_user

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):
    """Register a new user."""
    print(f"📝 Registration attempt for email: {user.email}")
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        print(f"⚠️ Registration failed - email already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    try:
        # Create new user
        hashed_password = get_password_hash(user.password)
        user_data = {
            "email": user.email,
            "full_name": user.full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        created_user = await create_user(user_data)
        print(f"✅ User registered successfully: {user.email}")
        return User(**created_user.model_dump())
        
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        raise
    except Exception as e:
        print(f"❌ Unexpected error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to server error"
        )
    

@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token."""
    user = await authenticate_user(form_data.username, form_data.password)  # username is email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/json", response_model=Token)
async def login_user_json(user_credentials: dict):
    """Authenticate user with JSON credentials and return access token."""
    email = user_credentials.get("email")
    password = user_credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user profile."""
    return User(**current_user.model_dump())

@router.get("/verify")
async def verify_token(current_user: UserInDB = Depends(get_current_active_user)):
    """Verify if token is valid."""
    return {"valid": True, "user": User(**current_user.model_dump())}

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is working."""
    return {"message": "✅ Authentication system is working!", "timestamp": datetime.utcnow()}