from fastapi import APIRouter

checks = APIRouter(prefix="/checks")


@checks.get("/liveliness")
async def liveliness():
    return "Ok!"
