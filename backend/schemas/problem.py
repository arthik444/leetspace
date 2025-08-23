# schemas/problem.py

from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class Solution(BaseModel):
    language: str
    code: str

class SpacedRepetition(BaseModel):
    repetitions: int = Field(default=0, description="Number of successful reviews")
    interval: int = Field(default=1, description="Days until next review")
    easiness: float = Field(default=2.5, description="Difficulty factor (1.3-3.0)")
    next_review: Optional[str] = Field(default=None, description="Next review date (ISO string)")
    last_reviewed: Optional[str] = Field(default=None, description="Last review date (ISO string)")
    review_history: List[Dict[str, Any]] = Field(default_factory=list, description="Review history")

class ProblemBase(BaseModel):
    title: str = Field(..., example="Two Sum")
    url: HttpUrl = Field(..., example="https://leetcode.com/problems/two-sum/")
    difficulty: str = Field(..., example="Easy")
    tags: List[str] = Field(default_factory=list)
    # time_taken_min: Optional[int] = Field(..., example=20)
    date_solved: date = Field(..., example="2025-06-24")
    notes: Optional[str] = Field(default=None, example="Used hashmap for lookup.")
    solutions: Optional[List[Solution]] = Field(default=None, example=["class Solution: ..."])
    # mistakes: Optional[str] = Field(default=None, example="Missed duplicate cases.")
    retry_later: str = Field(default=None, example="Yes")
    review_count: int = Field(default=0, description="Number of times this problem has been reviewed")
    spaced_repetition: Optional[SpacedRepetition] = Field(default=None, description="Spaced repetition data")


class ProblemCreate(ProblemBase):
    pass


# Create a partial update schema that only requires the fields being updated
class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[HttpUrl] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    # time_taken_min: Optional[int] = None
    date_solved: Optional[date] = None
    notes: Optional[str] = None
    solutions: Optional[List[Solution]] = None
    # mistakes: Optional[str] = None
    retry_later: Optional[str] = None
    review_count: Optional[int] = None
    spaced_repetition: Optional[SpacedRepetition] = None


class ProblemInDB(ProblemBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True
