# routes/analytics.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from auth.verify_token import get_current_active_user
from models.user import UserInDB
from datetime import datetime, timedelta
from collections import Counter, defaultdict

router = APIRouter()

# Import from problems storage (in real app, this would be shared database)
from routes.problems import problems_db, user_problems

@router.get("/dashboard")
async def get_dashboard_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get comprehensive dashboard statistics for the authenticated user
    """
    try:
        user_id = str(current_user.id)
        
        # Get all problems for the user
        user_problem_ids = user_problems.get(user_id, [])
        problems = [problems_db[pid] for pid in user_problem_ids if pid in problems_db]

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
    """Calculate basic statistics from problems"""
    total_problems = len(problems)
    
    # Count difficulty breakdown
    difficulty_counts = Counter(p.get("difficulty", "unknown") for p in problems)
    difficulty_breakdown = {
        "easy": difficulty_counts.get("easy", 0),
        "medium": difficulty_counts.get("medium", 0), 
        "hard": difficulty_counts.get("hard", 0)
    }
    
    # Count retry later problems
    retry_count = sum(1 for p in problems if p.get("retry_later", False))
    
    # Count unique active days
    dates = [p.get("created_at", datetime.utcnow()).date() for p in problems if p.get("created_at")]
    total_active_days = len(set(dates))
    
    # Most used tags
    all_tags = []
    for p in problems:
        all_tags.extend(p.get("tags", []))
    most_used_tags = [tag for tag, count in Counter(all_tags).most_common(5)]
    
    return {
        "total_problems": total_problems,
        "retry_count": retry_count,
        "total_active_days": total_active_days,
        "difficulty_breakdown": difficulty_breakdown,
        "most_used_tags": most_used_tags
    }

def detect_weaknesses(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Detect patterns that suggest weaknesses"""
    weaknesses = []
    
    if not problems:
        return weaknesses
    
    # Analyze retry patterns
    retry_problems = [p for p in problems if p.get("retry_later", False)]
    if retry_problems:
        # Group by tags to find problem areas
        retry_tags = []
        for p in retry_problems:
            retry_tags.extend(p.get("tags", []))
        
        tag_counts = Counter(retry_tags)
        for tag, count in tag_counts.most_common(3):
            if count >= 2:  # At least 2 problems with this tag need retry
                weaknesses.append({
                    "type": "tag",
                    "value": tag,
                    "count": count,
                    "description": f"Multiple problems with '{tag}' marked for retry"
                })
    
    # Analyze difficulty patterns
    difficulty_counts = Counter(p.get("difficulty") for p in problems)
    total = len(problems)
    
    for diff in ["easy", "medium", "hard"]:
        count = difficulty_counts.get(diff, 0)
        percentage = (count / total) * 100 if total > 0 else 0
        
        if diff == "easy" and percentage < 30 and total >= 10:
            weaknesses.append({
                "type": "difficulty",
                "value": diff,
                "count": count,
                "description": "Consider practicing more easy problems to build confidence"
            })
        elif diff == "hard" and percentage > 60 and total >= 5:
            weaknesses.append({
                "type": "difficulty", 
                "value": diff,
                "count": count,
                "description": "You might be jumping to hard problems too quickly"
            })
    
    return weaknesses

def suggest_todays_revision(problems: List[Dict]) -> Dict[str, Any]:
    """Suggest a problem for today's revision"""
    if not problems:
        return None
    
    # Find problems marked for retry
    retry_problems = [p for p in problems if p.get("retry_later", False)]
    
    if retry_problems:
        # Sort by date solved (oldest first for revision)
        retry_problems.sort(key=lambda x: x.get("created_at", datetime.min))
        problem = retry_problems[0]
        
        return {
            "id": problem.get("id"),
            "title": problem.get("title"),
            "difficulty": problem.get("difficulty"),
            "tags": problem.get("tags", []),
            "reason": "Marked for retry",
            "url": problem.get("url")
        }
    
    # If no retry problems, suggest oldest easy problem
    easy_problems = [p for p in problems if p.get("difficulty") == "easy"]
    if easy_problems:
        easy_problems.sort(key=lambda x: x.get("created_at", datetime.min))
        problem = easy_problems[0]
        
        return {
            "id": problem.get("id"),
            "title": problem.get("title"), 
            "difficulty": problem.get("difficulty"),
            "tags": problem.get("tags", []),
            "reason": "Revision of fundamentals",
            "url": problem.get("url")
        }
    
    return None

def generate_activity_heatmap(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Generate activity heatmap data"""
    if not problems:
        return []
    
    # Group problems by date
    date_counts = defaultdict(int)
    for problem in problems:
        if problem.get("created_at"):
            date = problem["created_at"].date() if isinstance(problem["created_at"], datetime) else datetime.fromisoformat(str(problem["created_at"])).date()
            date_counts[date] += 1
    
    # Generate last 90 days of data
    today = datetime.now().date()
    heatmap_data = []
    
    for i in range(90):
        date = today - timedelta(days=i)
        count = date_counts.get(date, 0)
        heatmap_data.append({
            "date": date.isoformat(),
            "count": count,
            "level": min(count, 4)  # Cap at level 4 for visualization
        })
    
    return list(reversed(heatmap_data))  # Chronological order

def get_recent_activity(problems: List[Dict]) -> List[Dict[str, Any]]:
    """Get recent activity"""
    if not problems:
        return []
    
    # Sort by creation date, most recent first
    sorted_problems = sorted(
        problems,
        key=lambda x: x.get("created_at", datetime.min),
        reverse=True
    )
    
    recent_activity = []
    for problem in sorted_problems[:10]:  # Last 10 activities
        recent_activity.append({
            "id": problem.get("id"),
            "title": problem.get("title"),
            "difficulty": problem.get("difficulty"),
            "tags": problem.get("tags", []),
            "date": problem.get("created_at").isoformat() if problem.get("created_at") else None,
            "action": "solved"
        })
    
    return recent_activity

@router.get("/stats/summary")
async def get_stats_summary(current_user: UserInDB = Depends(get_current_active_user)):
    """Get quick stats summary"""
    user_id = str(current_user.id)
    user_problem_ids = user_problems.get(user_id, [])
    problems = [problems_db[pid] for pid in user_problem_ids if pid in problems_db]
    
    if not problems:
        return {
            "total_problems": 0,
            "this_week": 0,
            "this_month": 0,
            "average_per_week": 0
        }
    
    now = datetime.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    this_week = len([p for p in problems if p.get("created_at") and p["created_at"] >= week_ago])
    this_month = len([p for p in problems if p.get("created_at") and p["created_at"] >= month_ago])
    
    # Calculate average per week (simple estimation)
    weeks_active = max(1, (now - min(p.get("created_at", now) for p in problems)).days / 7)
    average_per_week = len(problems) / weeks_active if weeks_active > 0 else 0
    
    return {
        "total_problems": len(problems),
        "this_week": this_week,
        "this_month": this_month,
        "average_per_week": round(average_per_week, 1)
    }