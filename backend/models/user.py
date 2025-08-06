from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic_core import core_schema
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
        cls._validate,
        core_schema.str_schema(),
        serialization=core_schema.plain_serializer_function_ser_schema(str),
    )


    @classmethod
    def _validate(cls, value: Any) -> ObjectId:
        if isinstance(value, ObjectId):
            return value
        if isinstance(value, str) and ObjectId.is_valid(value):
            return ObjectId(value)
        raise ValueError("Invalid ObjectId")

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    email_verified: bool = False
    auth_provider: str = "email"  # "email", "google", etc.
    google_id: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = Field(None, min_length=8, max_length=128)  # Optional for OAuth users

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class EmailVerificationRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class PasswordStrengthRequest(BaseModel):
    password: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: str  # Google JWT token

class UserInDB(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    # id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    hashed_password: Optional[str] = None  # Optional for OAuth users
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    # id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime
    updated_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None