import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.database.database import SessionLocal
from app.models.user import User

print("=========================================")
print(f"CONNECTING TO DATABASE: {settings.POSTGRES_DB}")
print("=========================================")

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Found {len(users)} users in the database!")
    for u in users:
        print(f"- {u.username} (Email: {u.email}) [Company: {u.company}]")
except Exception as e:
    print(f"Error querying users: {e}")
finally:
    db.close()
