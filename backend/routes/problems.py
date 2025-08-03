# routes/problems.py

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
from auth.verify_token import get_current_active_user
from models.user import UserInDB
from schemas.problem import ProblemCreate, ProblemInDB, ProblemUpdate
from datetime import datetime
from collections import Counter
from fastapi.responses import JSONResponse

# Temporary in-memory storage for problems (replace with MongoDB later)
problems_db = {}  # {problem_id: problem_data}
user_problems = {}  # {user_id: [problem_ids]}

router = APIRouter()

def get_next_problem_id():
    """Generate next problem ID"""
    return str(len(problems_db) + 1)

# POST a problem for a user
@router.post("/", response_model=ProblemInDB)
async def add_problem(
    problem: ProblemCreate, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Add a new problem for the authenticated user"""
    problem_dict = jsonable_encoder(problem)
    
    # Add user_id and metadata
    problem_dict["user_id"] = str(current_user.id)
    problem_dict["created_at"] = datetime.utcnow()
    problem_dict["updated_at"] = datetime.utcnow()
    
    # Check for conflicts
    conflicts = []
    
    # Check title conflict for this user
    for pid, p in problems_db.items():
        if p.get("user_id") == str(current_user.id) and p.get("title") == problem_dict["title"]:
            conflicts.append({"field": "title", "id": pid})
        if p.get("user_id") == str(current_user.id) and p.get("url") == problem_dict["url"]:
            conflicts.append({"field": "url", "id": pid})
    
    if conflicts:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Conflict on title or URL",
                "conflicts": conflicts
            }
        )
    
    # Generate ID and store problem
    problem_id = get_next_problem_id()
    problem_dict["id"] = problem_id
    
    problems_db[problem_id] = problem_dict
    
    # Update user's problem list
    user_id = str(current_user.id)
    if user_id not in user_problems:
        user_problems[user_id] = []
    user_problems[user_id].append(problem_id)
    
    return ProblemInDB(**problem_dict)

# GET Problems of a user
@router.get("/", response_model=List[ProblemInDB])
async def get_problems(
    difficulty: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    sortBy: Optional[str] = Query(None),
    sortOrder: Optional[str] = Query("desc"),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get all problems for the authenticated user with filtering and sorting"""
    user_id = str(current_user.id)
    
    # Get user's problems
    user_problem_ids = user_problems.get(user_id, [])
    user_problem_list = [problems_db[pid] for pid in user_problem_ids if pid in problems_db]
    
    # Apply filters
    filtered_problems = user_problem_list
    
    if difficulty:
        filtered_problems = [p for p in filtered_problems if p.get("difficulty") == difficulty]
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        filtered_problems = [
            p for p in filtered_problems 
            if any(tag in p.get("tags", []) for tag in tag_list)
        ]
    
    # Apply sorting
    if sortBy:
        reverse = sortOrder == "desc"
        if sortBy == "date":
            filtered_problems.sort(key=lambda x: x.get("created_at", datetime.min), reverse=reverse)
        elif sortBy == "difficulty":
            difficulty_order = {"easy": 1, "medium": 2, "hard": 3}
            filtered_problems.sort(
                key=lambda x: difficulty_order.get(x.get("difficulty"), 0), 
                reverse=reverse
            )
        elif sortBy == "title":
            filtered_problems.sort(key=lambda x: x.get("title", ""), reverse=reverse)
    
    return [ProblemInDB(**problem) for problem in filtered_problems]

# GET a specific problem
@router.get("/{problem_id}", response_model=ProblemInDB)
async def get_problem(
    problem_id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific problem by ID"""
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    problem = problems_db[problem_id]
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this problem")
    
    return ProblemInDB(**problem)

# PUT update a problem
@router.put("/{problem_id}", response_model=ProblemInDB)
async def update_problem(
    problem_id: str, 
    problem_update: ProblemUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a specific problem"""
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    problem = problems_db[problem_id]
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this problem")
    
    # Update the problem
    update_data = problem_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    problems_db[problem_id].update(update_data)
    
    return ProblemInDB(**problems_db[problem_id])

# DELETE a problem
@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a specific problem"""
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    problem = problems_db[problem_id]
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this problem")
    
    # Remove from storage
    del problems_db[problem_id]
    
    # Remove from user's problem list
    user_id = str(current_user.id)
    if user_id in user_problems and problem_id in user_problems[user_id]:
        user_problems[user_id].remove(problem_id)
    
    return {"detail": "Problem deleted successfully"}

# GET problem statistics for user
@router.get("/stats/overview")
async def get_problem_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """Get problem statistics for the authenticated user"""
    user_id = str(current_user.id)
    user_problem_ids = user_problems.get(user_id, [])
    user_problem_list = [problems_db[pid] for pid in user_problem_ids if pid in problems_db]
    
    if not user_problem_list:
        return {
            "total_problems": 0,
            "difficulty_breakdown": {"easy": 0, "medium": 0, "hard": 0},
            "tag_distribution": {},
            "recent_activity": []
        }
    
    # Calculate statistics
    difficulty_counts = Counter(p.get("difficulty", "unknown") for p in user_problem_list)
    tag_counts = Counter()
    for problem in user_problem_list:
        for tag in problem.get("tags", []):
            tag_counts[tag] += 1
    
    return {
        "total_problems": len(user_problem_list),
        "difficulty_breakdown": dict(difficulty_counts),
        "tag_distribution": dict(tag_counts.most_common(10)),
        "recent_activity": sorted(
            user_problem_list, 
            key=lambda x: x.get("created_at", datetime.min), 
            reverse=True
        )[:5]
    }



