import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.core.exception_handlers import app_exception_handler, unhandled_exception_handler
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.middleware.logging_middleware import log_requests
from app.routers import auth, availability, invitations, matches, merit, notifications, players, teams, ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("logs", exist_ok=True)
    os.makedirs(os.path.join(settings.STATIC_DIR, "avatars"), exist_ok=True)
    setup_logging()

    from app.database import engine
    from loguru import logger
    logger.info("Sixup API starting up")

    yield

    await engine.dispose()
    logger.info("Sixup API shut down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

os.makedirs(os.path.join(settings.STATIC_DIR, "avatars"), exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(players.router, prefix=API_PREFIX)
app.include_router(teams.router, prefix=API_PREFIX)
app.include_router(invitations.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(matches.router, prefix=API_PREFIX)
app.include_router(availability.router, prefix=API_PREFIX)
app.include_router(merit.router, prefix=API_PREFIX)
app.include_router(ws.router)  # no API_PREFIX — WebSocket path is /ws/matches/{id}


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
