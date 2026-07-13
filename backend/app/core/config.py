import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SocialPilot API"
    VERSION: str = "1.0.0"
    
    # ----------------------------------------
    # Relational Database (PostgreSQL)
    # ----------------------------------------
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "socialpilot")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Using pg8000 to avoid C++ build tool requirements on Windows
        return f"postgresql+pg8000://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # ----------------------------------------
    # Document Database (MongoDB)
    # ----------------------------------------
    MONGO_SERVER: str = os.getenv("MONGO_SERVER", "localhost")
    MONGO_PORT: str = os.getenv("MONGO_PORT", "27017")
    MONGO_USER: str = os.getenv("MONGO_USER", "admin")
    MONGO_PASSWORD: str = os.getenv("MONGO_PASSWORD", "adminpassword")
    MONGO_DB: str = os.getenv("MONGO_DB", "socialpilot_mongo")
    
    @property
    def MONGO_DATABASE_URI(self) -> str:
        # Connects to MongoDB, defaults to no-auth if variables are empty
        if self.MONGO_USER and self.MONGO_PASSWORD:
            return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_SERVER}:{self.MONGO_PORT}/?authSource=admin"
        return f"mongodb://{self.MONGO_SERVER}:{self.MONGO_PORT}/"
    
    class Config:
        env_file = ".env"

settings = Settings()

