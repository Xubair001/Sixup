from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger

from app.core.exceptions import AppException


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    log_fn = logger.error if exc.status_code >= 500 else logger.warning
    log_fn(
        "AppException on {path}: [{status}] {detail}",
        path=request.url.path,
        status=exc.status_code,
        detail=exc.detail,
    )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on {path}", path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
