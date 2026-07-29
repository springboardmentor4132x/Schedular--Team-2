import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine, Base
import app.models  # Import all models so Base knows about them

print("Dropping all existing tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables with the new schema...")
Base.metadata.create_all(bind=engine)

print("Success! The database has been reset with the new columns.")
