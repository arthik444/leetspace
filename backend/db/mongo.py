# db/mongo.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["leetspace"]
# collection = db["problems"]
# Collections
problems_collection = db["problems"]
users_collection = db["users"]

# Legacy collection reference for backwards compatibility
collection = problems_collection