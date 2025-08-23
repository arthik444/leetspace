# routes/analytics.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from db.mongo import db
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from auth.dependencies import get_current_active_user

router = APIRouter()
collection = db["problems"]

@router.get("/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_active_user)):
    """
    Get comprehensive dashboard statistics for the authenticated user
    """
    try:
        # Get all problems for the authenticated user
        cursor = collection.find({"user_id": current_user["uid"]})
        problems = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            problems.append(doc)

        if not problems:
            return {
                "basic_stats": {
                    "total_problems": 0,
                    "retry_count": 0,
                    "total_active_days": 0,
                    "difficulty_breakdown": {"easy": 0, "medium": 0, "hard": 0},
                    "most_used_tags": []
                },
                "weaknesses": [],
                "todays_revision": None,
                "activity_heatmap": [],
                "recent_activity": []
            }

        return {
            "basic_stats": calculate_basic_stats(problems),
            "weaknesses": detect_weaknesses(problems),
            "todays_revision": suggest_todays_revision(problems),
            "activity_heatmap": generate_activity_heatmap(problems),
            "recent_activity": get_recent_activity(problems)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_basic_stats(problems: List[Dict]) -> Dict[str, Any]:
    """Calculate total problems, retry count, active days, and difficulty breakdown"""
    
    # Total problems
    total_problems = len(problems)
    
    # Retry later count
    retry_count = sum(1 for p in problems if (p.get("retry_later") == "Yes" or p.get("retry_later") is True))
    
    # Total active days (unique dates)
    unique_dates = set()
    for problem in problems:
        date_solved = problem.get("date_solved")
        if date_solved:
            unique_dates.add(date_solved)
    total_active_days = len(unique_dates)
    
    # Difficulty breakdown
    difficulty_counts = Counter(p.get("difficulty") for p in problems if p.get("difficulty"))
    difficulty_breakdown = {
        "easy": difficulty_counts.get("Easy", 0),
        "medium": difficulty_counts.get("Medium", 0), 
        "hard": difficulty_counts.get("Hard", 0)
    }
    
    # Most used tags (keeping for the detailed section below)
    all_tags = []
    for problem in problems:
        tags = problem.get("tags", [])
        all_tags.extend(tags)
    
    tag_counts = Counter(all_tags)
    most_used_tags = [
        {"tag": tag, "count": count} 
        for tag, count in tag_counts.most_common(5)
    ]
    
    return {
        "total_problems": total_problems,
        "retry_count": retry_count,
        "total_active_days": total_active_days,
        "difficulty_breakdown": difficulty_breakdown,
        "most_used_tags": most_used_tags  # Keep for detailed section
    }

def detect_weaknesses(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Detect weakness areas based on retry rate > 30%"""
    
    tag_stats = defaultdict(lambda: {"total": 0, "retry_count": 0})
    
    # Calculate retry rate per tag
    for problem in problems:
        tags = problem.get("tags", [])
        is_retry = problem.get("retry_later") == "Yes"
        
        for tag in tags:
            tag_stats[tag]["total"] += 1
            if problem.get("retry_later") in ("Yes", True):
                tag_stats[tag]["retry_count"] += 1
    
    # Find weakness areas (retry rate > 30% and at least 3 problems)
    weaknesses = []
    for tag, stats in tag_stats.items():
        if stats["total"] >= 3:  # Need minimum problems to be meaningful
            retry_rate = stats["retry_count"] / stats["total"]
            if retry_rate > 0.30:  # 30% threshold
                weaknesses.append({
                    "tag": tag,
                    "retry_rate": round(retry_rate * 100),
                    "total_problems": stats["total"],
                    "retry_count": stats["retry_count"]
                })
    
    # Sort by retry rate (worst first)
    weaknesses.sort(key=lambda x: x["retry_rate"], reverse=True)
    return weaknesses

def suggest_todays_revision(problems: List[Dict]) -> Dict[str, Any]:
    """Suggest a problem to revise today from the retry queue"""
    
    today = datetime.now()
    
    # Build dynamic queue from problems with retry_later = "Yes"
    retry_queue = []
    for problem in problems:
        if problem.get("retry_later") == "Yes":
            try:
                solved_date = datetime.strptime(str(problem["date_solved"]), "%Y-%m-%d")
                days_since = (today - solved_date).days
                
                # Calculate priority score based on days since solved and difficulty
                difficulty_bonus = {"Easy": 1, "Medium": 2, "Hard": 3}
                priority_score = days_since * difficulty_bonus.get(problem.get("difficulty"), 1)
                
                retry_queue.append({
                    "problem": problem,
                    "priority_score": priority_score,
                    "days_since": days_since
                })
                
            except (ValueError, TypeError):
                continue  # Skip problems with invalid dates
    
    if not retry_queue:
        return None
    
    # Sort by priority score (highest first) - problems overdue longer get higher priority
    retry_queue.sort(key=lambda x: x["priority_score"], reverse=True)
    best_suggestion = retry_queue[0]
    
    return {
        "id": best_suggestion["problem"]["id"],
        "title": best_suggestion["problem"]["title"],
        "difficulty": best_suggestion["problem"]["difficulty"],
        "tags": best_suggestion["problem"].get("tags", []),
        "days_since_solved": best_suggestion["days_since"],
        "review_count": best_suggestion["problem"].get("review_count", 0),
        "retry_later": best_suggestion["problem"].get("retry_later")
    }

def generate_activity_heatmap(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Generate activity heatmap data for the last 365 days"""
    
    today = datetime.now()
    start_date = today - timedelta(days=365)
    
    # Count problems solved per date
    date_counts = defaultdict(int)
    for problem in problems:
        try:
            solved_date = datetime.strptime(str(problem["date_solved"]), "%Y-%m-%d")
            if solved_date >= start_date:
                date_str = solved_date.strftime("%Y-%m-%d")
                date_counts[date_str] += 1
        except (ValueError, TypeError):
            continue
    
    # Generate heatmap data
    heatmap_data = []
    current_date = start_date
    
    while current_date <= today:
        date_str = current_date.strftime("%Y-%m-%d")
        count = date_counts.get(date_str, 0)
        
        heatmap_data.append({
            "date": date_str,
            "count": count,
            "level": min(count, 4)  # 0-4 intensity levels for styling
        })
        
        current_date += timedelta(days=1)
    
    return heatmap_data

def get_recent_activity(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Get the 5 most recently solved problems"""
    
    # Sort by date_solved (most recent first)
    try:
        sorted_problems = sorted(
            problems,
            key=lambda x: datetime.strptime(str(x["date_solved"]), "%Y-%m-%d"),
            reverse=True
        )
    except (ValueError, TypeError):
        # If date parsing fails, return empty
        return []
    
    recent = sorted_problems[:5]
    
    # Format for frontend
    formatted_recent = []
    for problem in recent:
        try:
            solved_date = datetime.strptime(str(problem["date_solved"]), "%Y-%m-%d")
            days_ago = (datetime.now() - solved_date).days
            
            if days_ago == 0:
                time_ago = "Today"
            elif days_ago == 1:
                time_ago = "1 day ago"
            else:
                time_ago = f"{days_ago} days ago"
            
            formatted_recent.append({
                "id": problem["id"],
                "title": problem["title"],
                "difficulty": problem["difficulty"],
                "tags": problem.get("tags", [])[:3],  # Limit to 3 tags
                "time_ago": time_ago,
                "retry_later": problem.get("retry_later") == "Yes"
            })
        except (ValueError, TypeError):
            continue
    
    return formatted_recent

@router.get("/spaced-repetition")
async def get_spaced_repetition_stats(current_user: dict = Depends(get_current_active_user)):
    """
    Get spaced repetition statistics for the authenticated user
    """
    try:
        # Get all problems for the authenticated user
        cursor = collection.find({"user_id": current_user["uid"]})
        problems = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            problems.append(doc)

        if not problems:
            return {
                "total_problems": 0,
                "problems_with_sr": 0,
                "todays_revisions": 0,
                "overdue_revisions": 0,
                "average_easiness": 0,
                "total_reviews": 0,
                "recent_reviews": []
            }

        # Calculate spaced repetition statistics
        problems_with_sr = [p for p in problems if p.get("spaced_repetition")]
        todays_revisions = []
        overdue_revisions = []
        total_reviews = 0
        easiness_scores = []
        recent_reviews = []

        today = datetime.now()
        
        for problem in problems_with_sr:
            sr_data = problem["spaced_repetition"]
            
            # Count total reviews
            if sr_data.get("review_history"):
                total_reviews += len(sr_data["review_history"])
                
                # Get recent reviews (last 10)
                for review in sr_data["review_history"][-10:]:
                    recent_reviews.append({
                        "problem_id": problem["id"],
                        "problem_title": problem["title"],
                        "review_date": review.get("date"),
                        "quality": review.get("quality"),
                        "action": review.get("action", "reviewed")
                    })
            
            # Check if due for revision today
            if sr_data.get("next_review"):
                try:
                    next_review = datetime.fromisoformat(sr_data["next_review"])
                    if next_review <= today:
                        if next_review.date() == today.date():
                            todays_revisions.append(problem["id"])
                        else:
                            overdue_revisions.append(problem["id"])
                except (ValueError, TypeError):
                    continue
            
            # Collect easiness scores
            if sr_data.get("easiness"):
                easiness_scores.append(sr_data["easiness"])

        # Sort recent reviews by date (most recent first)
        recent_reviews.sort(key=lambda x: x.get("review_date", ""), reverse=True)
        recent_reviews = recent_reviews[:10]  # Keep only last 10

        return {
            "total_problems": len(problems),
            "problems_with_sr": len(problems_with_sr),
            "todays_revisions": len(todays_revisions),
            "overdue_revisions": len(overdue_revisions),
            "average_easiness": round(sum(easiness_scores) / len(easiness_scores), 2) if easiness_scores else 0,
            "total_reviews": total_reviews,
            "recent_reviews": recent_reviews
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))