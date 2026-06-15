from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.dependencies.auth import get_current_user_payload
from app.dependencies.services import get_auth_service
from app.repositories.user_repo import UserRepository
from app.schemas.auth import CurrentUserResponse, LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    data: RegisterRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return await service.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return await service.refresh(data.refresh_token)


@router.get("/me", response_model=CurrentUserResponse)
async def me(
    payload: Annotated[dict, Depends(get_current_user_payload)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user = await UserRepository(session).get_by_id(int(payload["sub"]))
    return CurrentUserResponse(
        id=user.id,
        public_id=user.public_id,
        username=user.username,
        email=user.email,
        system_role=user.system_role,
        is_verified=user.is_verified,
    )
