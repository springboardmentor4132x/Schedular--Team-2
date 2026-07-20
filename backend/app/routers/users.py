from fastapi import APIRouter

router = APIRouter(
    perfix="/users",
    tags=["Users"]
)

