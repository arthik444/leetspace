# routes/problems.py

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
# from db.mongo import db
from db.mongo import problems_collection
from schemas.problem import ProblemCreate, ProblemInDB, ProblemUpdate
from bson import ObjectId
from datetime import datetime
from collections import Counter
from fastapi.responses import JSONResponse
from auth.verify_token import get_current_active_user
from models.user import UserInDB


router = APIRouter()

# collection = db["problems"]
collection = problems_collection

# POST a problem for a user

@router.post("/", response_model=ProblemInDB)
# async def add_problem(problem: ProblemCreate):
async def add_problem(
    problem: ProblemCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    problem_dict = jsonable_encoder(problem)
    # Set the user_id from the authenticated user
    problem_dict["user_id"] = str(current_user.id)

    conflicts = []

    # Check for conflicts within the current user's problems only
    title_conflict = await collection.find_one({
        "title": problem_dict["title"], 
        "user_id": str(current_user.id)
    })
    if title_conflict:
        conflicts.append({"field": "title", "id": str(title_conflict["_id"])})

    url_conflict = await collection.find_one({
        "url": problem_dict["url"], 
        "user_id": str(current_user.id)
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

    result = await collection.insert_one(problem_dict)
    return ProblemInDB(id=str(result.inserted_id), **problem_dict)

# GET Problems of a user

@router.get("/", response_model=List[ProblemInDB])
async def get_problems(
    # user_id: str,
    difficulty: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    retry_later: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "date_solved",
    order: Optional[str] = "desc",
    current_user: UserInDB = Depends(get_current_active_user)
):
    query = {"user_id": str(current_user.id)}

    if difficulty:
        query["difficulty"] = difficulty
    if retry_later is not None:
        query["retry_later"] = retry_later
    if tags:
        query["tags"] = {"$all": tags}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"notes": {"$regex": search, "$options": "i"}},
        ]

    sort_order = -1 if order == "desc" else 1
    cursor = collection.find(query).sort(sort_by, sort_order)

    problems = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        problems.append(ProblemInDB(**doc))

    return problems

# GET stats
@router.get("/stats")
# async def get_stats(user_id: str):
async def get_stats(current_user: UserInDB = Depends(get_current_active_user)):
    try:
        # # 1. Get all problems for the user
        # cursor = collection.find({"user_id": user_id})
        # 1. Get all problems for the authenticated user
        cursor = collection.find({"user_id": str(current_user.id)})
        problems = []
        async for doc in cursor:
            problems.append(doc)

        if not problems:
            return {
                "total_solved": 0,
                "by_difficulty": {},
                "most_common_tags": [],
                "total_time_minutes": 0,
                "retry_later_count": 0
            }

        # 2. Count by difficulty
        difficulty_count = Counter(p["difficulty"] for p in problems)

        # 3. Most common tags
        tags = []
        for p in problems:
            tags.extend(p.get("tags", []))
        tag_count = Counter(tags).most_common(5)  # top 5
        most_common_tags = [tag for tag, _ in tag_count]

        # 4. Total time spent
        total_time = sum(p.get("time_taken_min", 0) for p in problems)

        # 5. Retry later count
        retry_count = sum(1 for p in problems if p.get("retry_later") is True)

        return {
            "total_solved": len(problems),
            "by_difficulty": difficulty_count,
            "most_common_tags": most_common_tags,
            "total_time_minutes": total_time,
            "retry_later_count": retry_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET a problem

@router.get("/{id}", response_model=ProblemInDB)
# async def get_problem(id: str):
#     doc = await collection.find_one({"_id": ObjectId(id)})
async def get_problem(
    id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    # Ensure user can only access their own problems
    doc = await collection.find_one({
        "_id": ObjectId(id), 
        "user_id": str(current_user.id)
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Problem not found")
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return ProblemInDB(**doc)

# PUT update a problem

@router.put("/{id}", response_model=ProblemInDB)
# async def update_problem(id: str, update: ProblemUpdate):
async def update_problem(
    id: str, 
    update: ProblemUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    update_data = {k: v for k, v in update.dict().items() if v is not None}

    if "url" in update_data:
        update_data["url"] = str(update_data["url"])

    if "date_solved" in update_data:
        update_data["date_solved"] = update_data["date_solved"].isoformat()

    conflicts = []

    if "title" in update_data:
        existing_title = await collection.find_one({
            "title": update_data["title"],
            "user_id": str(current_user.id),
            "_id": {"$ne": ObjectId(id)}
        })
        if existing_title:
            conflicts.append({"field": "title", "id": str(existing_title["_id"])})

    if "url" in update_data:
        existing_url = await collection.find_one({
            "url": update_data["url"],
            "user_id": str(current_user.id),
            "_id": {"$ne": ObjectId(id)}
        })
        if existing_url:
            conflicts.append({"field": "url", "id": str(existing_url["_id"])})

    if conflicts:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Conflict on title or URL",
                "conflicts": conflicts
            }
        )

    result = await collection.find_one_and_update(
        # {"_id": ObjectId(id)},
        {"_id": ObjectId(id), "user_id": str(current_user.id)},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Problem not found")

    result["id"] = str(result["_id"])
    del result["_id"]
    return ProblemInDB(**result)

# Delete a problem
@router.delete("/{id}")
# async def delete_problem(id: str):
#     result = await collection.delete_one({"_id": ObjectId(id)})
async def delete_problem(
    id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    # Ensure user can only delete their own problems
    result = await collection.delete_one({
        "_id": ObjectId(id), 
        "user_id": str(current_user.id)
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"detail": "Problem deleted successfully"}



