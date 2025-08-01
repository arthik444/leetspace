# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.mongo import db
from routes import problems, analytics, auth
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="LeetSpace API",
    description="A comprehensive platform for tracking coding problems and analytics",
    version="1.0.0"
)

# CORS setup with proper security
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Add production origins when deployed
if settings.environment == "production":
    allowed_origins.extend([
        "https://your-production-domain.com",
        # Add your actual production domains here
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
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