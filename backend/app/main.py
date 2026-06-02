from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.scheduler import start_scheduler
from app.routers import signals


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_scheduler()
    yield


app = FastAPI(
    title="Smart Money Radar API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(signals.router)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.ENV}


@app.get("/")
def root():
    return {"name": "Smart Money Radar", "docs": "/docs"}
