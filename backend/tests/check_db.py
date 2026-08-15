import os
from app.core.config import settings
print(f"CONNECTING TO DB: {settings.POSTGRES_DB}")
print(f"FULL URI: {settings.SQLALCHEMY_DATABASE_URI}")
