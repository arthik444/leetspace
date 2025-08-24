# main.py

from fastapi import FastAPI, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from db.mongo import db
from routes import problems, analytics, problems_debug
from routes import analytics_debug
from auth.dependencies import get_current_active_user
import os
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security headers
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
	async def dispatch(self, request: Request, call_next):
		response = await call_next(request)
		response.headers.setdefault("X-Content-Type-Options", "nosniff")
		response.headers.setdefault("X-Frame-Options", "DENY")
		response.headers.setdefault("Referrer-Policy", "no-referrer")
		response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		# Optional HSTS (enable only when serving strictly over HTTPS)
		if os.getenv("ENABLE_HSTS", "0") == "1":
			response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS setup for frontend
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
cors_origins = ["*"] if allowed_origins_env.strip() == "*" else [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
app.add_middleware(
	CORSMiddleware,
	allow_origins=cors_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Include routers
app.include_router(problems.router, prefix="/api/problems", tags=["Problems"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

# Debug routers (disabled by default; enable with ENABLE_DEBUG_ROUTES=1)
if os.getenv("ENABLE_DEBUG_ROUTES", "0") == "1":
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