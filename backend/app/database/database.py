from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient

from app.core.config import settings

# =====================================================
# POSTGRESQL SETUP (Relational Database)
# =====================================================

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """
    Dependency to get a PostgreSQL DB session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# MONGODB SETUP (Document Database)
# =====================================================

try:
    mongo_client = MongoClient(
        settings.MONGO_DATABASE_URI,
        serverSelectionTimeoutMS=5000
    )

    mongo_db = mongo_client[settings.MONGO_DB]

except Exception as e:
    print(f"Warning: Could not connect to MongoDB - {e}")
    mongo_db = None


def get_mongo_db():
    """
    Dependency to get the MongoDB instance
    """
    return mongo_db