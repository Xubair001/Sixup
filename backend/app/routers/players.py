from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.config import settings
from app.core.exceptions import ValidationError
from app.dependencies.auth import get_current_user_id
from app.dependencies.services import get_player_service, get_privacy_service
from app.schemas.common import PaginatedResponse
from app.schemas.player import PlayerProfileResponse, PlayerProfileUpdate, PlayerSearchResult
from app.services.player_service import PlayerService
from app.services.privacy_service import PrivacyService

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/me", response_model=PlayerProfileResponse)
async def get_my_profile(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[PlayerService, Depends(get_player_service)],
):
    return await service.get_profile(user_id)


@router.put("/me", response_model=PlayerProfileResponse)
async def update_my_profile(
    data: PlayerProfileUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[PlayerService, Depends(get_player_service)],
):
    return await service.update_profile(user_id, data)


@router.post("/me/avatar", response_model=dict)
async def upload_avatar(
    file: Annotated[UploadFile, File(...)],
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[PlayerService, Depends(get_player_service)],
):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed")

    content = await file.read()
    max_bytes = settings.MAX_AVATAR_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationError(f"File must be under {settings.MAX_AVATAR_SIZE_MB}MB")

    url = await service.update_avatar(user_id, content, file.content_type)
    return {"avatar_url": url}


@router.get("/search", response_model=list[PlayerSearchResult])
async def search_players(
    q: Annotated[str, Query(min_length=1, max_length=50)],
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[PlayerService, Depends(get_player_service)],
):
    return await service.search(q)


@router.get("/{user_id}/profile", response_model=PlayerProfileResponse)
async def get_player_profile(
    user_id: int,
    viewer_id: Annotated[int, Depends(get_current_user_id)],
    player_service: Annotated[PlayerService, Depends(get_player_service)],
    privacy_service: Annotated[PrivacyService, Depends(get_privacy_service)],
):
    await privacy_service.assert_can_view_stats(viewer_id, user_id)
    return await player_service.get_profile(user_id)
