# main.py

from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from db.mongo import db
from routes import problems, analytics, problems_debug
from routes import analytics_debug
from auth.dependencies import get_current_active_user
import os

app = FastAPI()

# CORS setup for frontend (environment-driven)
origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if origins_env.strip() == "*" else [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers (debug routes conditional)
app.include_router(problems.router, prefix="/api/problems", tags=["Problems"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
enable_debug = os.getenv("ENABLE_DEBUG_ROUTES", "false").lower() in ("1", "true", "yes")
if enable_debug:
    app.include_router(analytics_debug.router, prefix="/api/analytics", tags=["Analytics Debug"])
    app.include_router(problems_debug.router, prefix="/api/problems", tags=["Problems Debug"])

@app.get("/")
def root():
    return {"message": "Welcome to LeetSpace API with Firebase Auth 🚀🔐"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "auth": "firebase"}

@app.get("/test-auth")
async def test_auth(current_user: dict = Depends(get_current_active_user)):
    return {
        "message": "Authentication successful!",
        "user": {
            "uid": current_user["uid"],
            "email": current_user["email"],
            "email_verified": current_user["email_verified"]
        }
    }

@app.get("/debug-auth")
async def debug_auth(authorization: str = Header(None)):
    return {
        "authorization_header": authorization,
        "message": "Debug endpoint to check headers"
    }

@app.get("/simple-test")
async def simple_test():
    return {"message": "This endpoint has no authentication", "status": "working"}

# @app.get("/")
# def root():
#     return {"message": "Welcome to LeetSpace API 🚀"}

# @app.get("/test-db")
# async def test_db():
#     collections = await db.list_collection_names()
#     return {"collections": collections}

# from urllib.parse import quote_plus

# password = quote_plus("leetspace_user")
# print(password)

# Create useful indexes on startup
@app.on_event("startup")
async def create_indexes() -> None:
    try:
        await db["problems"].create_index([("user_id", 1)])
        await db["problems"].create_index([("user_id", 1), ("date_solved", -1)])
        await db["problems"].create_index([("retry_later", 1)])
        await db["problems"].create_index([("tags", 1)])
        await db["activity_events"].create_index([("user_id", 1), ("date", -1)])
        await db["revision_locks"].create_index([("user_id", 1), ("date", 1)], unique=True)
    except Exception as e:
        # Avoid crashing app on index creation failure in first deploys
        print("Index creation skipped:", e)