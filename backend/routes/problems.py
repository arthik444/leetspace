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
from db.mongo import db
from bson import ObjectId

router = APIRouter()

# MongoDB collections
problems_collection = db["problems"]

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
    
    # Check for conflicts (title and URL must be unique per user)
    conflicts = []
    
    title_conflict = await problems_collection.find_one({
        "user_id": str(current_user.id),
        "title": problem_dict["title"]
    })
    if title_conflict:
        conflicts.append({"field": "title", "id": str(title_conflict["_id"])})
    
    url_conflict = await problems_collection.find_one({
        "user_id": str(current_user.id),
        "url": problem_dict["url"]
    })
    if url_conflict:
        conflicts.append({"field": "url", "id": str(url_conflict["_id"])})
    
    if conflicts:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Conflict on title or URL",
                "conflicts": conflicts
            }
        )
    
    # Insert into MongoDB
    result = await problems_collection.insert_one(problem_dict)
    problem_dict["id"] = str(result.inserted_id)
    problem_dict["_id"] = result.inserted_id
    
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
    
    # Build MongoDB query
    query = {"user_id": user_id}
    
    # Apply filters
    if difficulty:
        query["difficulty"] = difficulty
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    # Build sort criteria
    sort_criteria = []
    if sortBy:
        sort_direction = -1 if sortOrder == "desc" else 1
        if sortBy == "date":
            sort_criteria.append(("created_at", sort_direction))
        elif sortBy == "difficulty":
            # Custom sorting for difficulty
            sort_criteria.append(("difficulty", sort_direction))
        elif sortBy == "title":
            sort_criteria.append(("title", sort_direction))
    else:
        # Default sort by creation date
        sort_criteria.append(("created_at", -1))
    
    # Execute query
    cursor = problems_collection.find(query)
    if sort_criteria:
        cursor = cursor.sort(sort_criteria)
    
    problems = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        problems.append(ProblemInDB(**doc))
    
    return problems

# GET a specific problem
@router.get("/{problem_id}", response_model=ProblemInDB)
async def get_problem(
    problem_id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific problem by ID"""
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")
    
    problem = await problems_collection.find_one({"_id": ObjectId(problem_id)})
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this problem")
    
    problem["id"] = str(problem["_id"])
    return ProblemInDB(**problem)

# PUT update a problem
@router.put("/{problem_id}", response_model=ProblemInDB)
async def update_problem(
    problem_id: str, 
    problem_update: ProblemUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a specific problem"""
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")
    
    problem = await problems_collection.find_one({"_id": ObjectId(problem_id)})
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this problem")
    
    # Prepare update data
    update_data = problem_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Check for conflicts if title or URL is being updated
    conflicts = []
    if "title" in update_data:
        title_conflict = await problems_collection.find_one({
            "user_id": str(current_user.id),
            "title": update_data["title"],
            "_id": {"$ne": ObjectId(problem_id)}
        })
        if title_conflict:
            conflicts.append({"field": "title", "id": str(title_conflict["_id"])})
    
    if "url" in update_data:
        url_conflict = await problems_collection.find_one({
            "user_id": str(current_user.id),
            "url": update_data["url"],
            "_id": {"$ne": ObjectId(problem_id)}
        })
        if url_conflict:
            conflicts.append({"field": "url", "id": str(url_conflict["_id"])})
    
    if conflicts:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Conflict on title or URL",
                "conflicts": conflicts
            }
        )
    
    # Update the problem
    result = await problems_collection.find_one_and_update(
        {"_id": ObjectId(problem_id)},
        {"$set": update_data},
        return_document=True
    )
    
    result["id"] = str(result["_id"])
    return ProblemInDB(**result)

# DELETE a problem
@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a specific problem"""
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")
    
    problem = await problems_collection.find_one({"_id": ObjectId(problem_id)})
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if user owns this problem
    if problem.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this problem")
    
    # Delete the problem
    result = await problems_collection.delete_one({"_id": ObjectId(problem_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    return {"detail": "Problem deleted successfully"}

# GET problem statistics for user
@router.get("/stats/overview")
async def get_problem_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """Get problem statistics for the authenticated user"""
    user_id = str(current_user.id)
    
    # Get all problems for the user
    cursor = problems_collection.find({"user_id": user_id})
    problems = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        problems.append(doc)
    
    if not problems:
        return {
            "total_problems": 0,
            "difficulty_breakdown": {"easy": 0, "medium": 0, "hard": 0},
            "tag_distribution": {},
            "recent_activity": []
        }
    
    # Calculate statistics
    difficulty_counts = Counter(p.get("difficulty", "unknown") for p in problems)
    tag_counts = Counter()
    for problem in problems:
        for tag in problem.get("tags", []):
            tag_counts[tag] += 1
    
    # Get recent activity
    recent_problems = sorted(
        problems, 
        key=lambda x: x.get("created_at", datetime.min), 
        reverse=True
    )[:5]
    
    return {
        "total_problems": len(problems),
        "difficulty_breakdown": dict(difficulty_counts),
        "tag_distribution": dict(tag_counts.most_common(10)),
        "recent_activity": [
            {
                "id": p["id"],
                "title": p.get("title"),
                "difficulty": p.get("difficulty"),
                "created_at": p.get("created_at").isoformat() if p.get("created_at") else None
            }
            for p in recent_problems
        ]
    }



