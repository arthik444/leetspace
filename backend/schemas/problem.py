# schemas/problem.py

from pydantic import BaseModel, HttpUrl, Field, ConfigDict
from typing import List, Optional
from datetime import date, datetime

class Solution(BaseModel):
    language: str
    code: str

class ProblemBase(BaseModel):
    title: str = Field(..., example="Two Sum")
    url: HttpUrl = Field(..., example="https://leetcode.com/problems/two-sum/")
    difficulty: str = Field(..., example="easy")
    tags: List[str] = Field(default_factory=list)
    date_solved: Optional[date] = Field(default=None, example="2025-06-24")
    notes: Optional[str] = Field(default=None, example="Used hashmap for lookup.")
    solutions: Optional[List[Solution]] = Field(default=None)
    retry_later: Optional[bool] = Field(default=False, example=False)

class ProblemCreate(ProblemBase):
    # user_id is automatically added from authentication, not provided by user
    pass

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[HttpUrl] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    date_solved: Optional[date] = None
    notes: Optional[str] = None
    solutions: Optional[List[Solution]] = None
    retry_later: Optional[bool] = None

class ProblemInDB(ProblemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
