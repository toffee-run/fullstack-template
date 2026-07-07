from fastapi import FastAPI
from src.routes import checks

app = FastAPI()
app.include_router(checks)
