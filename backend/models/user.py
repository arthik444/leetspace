from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

class UserProfile(BaseModel):
    """User profile information"""
    display_name: Optional[str] = None
    bio: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    preferred_language: str = "python"
    timezone: str = "UTC"

class UserStats(BaseModel):
    """User statistics"""
    total_problems_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    current_streak: int = 0
    max_streak: int = 0
    total_time_spent_minutes: int = 0
    favorite_tags: List[str] = []

class UserPreferences(BaseModel):
    """User preferences and settings"""
    email_notifications: bool = True
    daily_reminder: bool = False
    weekly_summary: bool = True
    theme: str = "light"  # light, dark, auto
    language: str = "en"

class UserSecurity(BaseModel):
    """User security information"""
    last_login: Optional[datetime] = None
    last_password_change: Optional[datetime] = None
    failed_login_attempts: int = 0
    account_locked_until: Optional[datetime] = None
    two_factor_enabled: bool = False
    backup_codes: List[str] = []
    trusted_devices: List[str] = []

class UserInDB(BaseModel):
    """Complete user model as stored in database"""
    id: str = Field(alias="_id")
    firebase_uid: str = Field(..., unique=True, index=True)
    email: EmailStr = Field(..., unique=True, index=True)
    email_verified: bool = False
    
    # Profile information
    profile: UserProfile = UserProfile()
    
    # Statistics
    stats: UserStats = UserStats()
    
    # Preferences
    preferences: UserPreferences = UserPreferences()
    
    # Security
    security: UserSecurity = UserSecurity()
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_admin: bool = False
    subscription_tier: str = "free"  # free, premium, enterprise
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Renamed from allow_population_by_field_name in Pydantic v2
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserCreate(BaseModel):
    """Schema for creating a new user"""
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None

class UserUpdate(BaseModel):
    """Schema for updating user information"""
    profile: Optional[UserProfile] = None
    preferences: Optional[UserPreferences] = None
    
class UserPublic(BaseModel):
    """Public user information (safe to expose)"""
    id: str
    display_name: Optional[str]
    bio: Optional[str]
    github_username: Optional[str]
    linkedin_url: Optional[str]
    website_url: Optional[str]
    stats: UserStats
    created_at: datetime
    subscription_tier: str