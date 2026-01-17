# Support Swarm Database Configuration - Disabled for now
from datetime import datetime

# Database is disabled - using in-memory storage
SessionLocal = None
engine = None

def init_db():
    """Initialize database tables - currently disabled"""
    print("[DB] Database disabled - using in-memory conversation storage")
    print("[DB] To enable: fix DATABASE_URL and install asyncpg")

def get_db():
    """Get database session - returns None when DB disabled"""
    return None
