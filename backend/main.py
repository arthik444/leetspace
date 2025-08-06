# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.mongo import db
# from routes import problems, analytics,auth  # Optional for now if not created

# app = FastAPI()
from db.user_operations import ensure_user_indexes
from db.token_blacklist import ensure_blacklist_indexes
from db.refresh_tokens import ensure_refresh_token_indexes
from db.password_reset import ensure_password_reset_indexes
from db.email_verification import ensure_verification_indexes
from routes import problems, analytics, auth
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await ensure_user_indexes()
        await ensure_blacklist_indexes()
        await ensure_refresh_token_indexes()
        await ensure_password_reset_indexes()
        await ensure_verification_indexes()
        print("✅ MongoDB user indexes created")
        print("✅ MongoDB blacklist indexes created")
        print("✅ MongoDB refresh token indexes created")
        print("✅ MongoDB password reset indexes created")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        print("🔄 Server will start without MongoDB connection (development mode)")
    yield
    # Shutdown
    print("🔧 Application shutdown")

app = FastAPI(lifespan=lifespan)

# Optional CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (optional if not made yet)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])  # Added auth router
app.include_router(problems.router, prefix="/api/problems", tags=["Problems"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

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