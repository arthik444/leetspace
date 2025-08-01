# schemas/problem.py

from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import date

class Solution(BaseModel):
    language: str
    code: str

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


class ProblemCreate(ProblemBase):
    user_id: str = Field(..., example="abc123")


class ProblemUpdate(BaseModel):
    title: Optional[str]
    url: Optional[HttpUrl]
    difficulty: Optional[str]
    tags: Optional[List[str]]
    # time_taken_min: Optional[int]
    date_solved: Optional[date]
    notes: Optional[str]
    solutions: Optional[List[Solution]]
    # mistakes: Optional[str]
    retry_later: Optional[str]


class ProblemInDB(ProblemBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True
