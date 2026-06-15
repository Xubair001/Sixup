from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import get_current_user_id
from app.dependencies.services import get_notification_service
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
async def get_notifications(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[NotificationService, Depends(get_notification_service)],
    limit: int = Query(30, le=100),
    offset: int = Query(0, ge=0),
):
    return await service.get_for_user(user_id, limit=limit, offset=offset)


@router.get("/unread-count", response_model=dict)
async def unread_count(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[NotificationService, Depends(get_notification_service)],
):
    count = await service.unread_count(user_id)
    return {"count": count}


@router.post("/read-all", response_model=MessageResponse)
async def mark_all_read(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[NotificationService, Depends(get_notification_service)],
):
    await service.mark_all_read(user_id)
    return MessageResponse(message="All notifications marked as read")


@router.post("/{notif_id}/read", response_model=MessageResponse)
async def mark_one_read(
    notif_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[NotificationService, Depends(get_notification_service)],
):
    await service.mark_one_read(notif_id, user_id)
    return MessageResponse(message="Notification marked as read")
