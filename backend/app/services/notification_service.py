from typing import Any

from loguru import logger

from app.models.notification import Notification
from app.repositories.notification_repo import NotificationRepository
from app.services.base import BaseService


class NotificationService(BaseService[NotificationRepository]):

    async def create(
        self,
        user_id: int,
        type: str,
        title: str,
        body: str,
        payload: dict[str, Any] | None = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            payload=payload,
        )
        notif = await self.repo.create(notif)
        logger.debug("Notification created for user {uid}: {type}", uid=user_id, type=type)
        return notif

    async def get_for_user(self, user_id: int, limit: int = 30, offset: int = 0) -> list[Notification]:
        return await self.repo.get_for_user(user_id, limit=limit, offset=offset)

    async def mark_all_read(self, user_id: int) -> None:
        await self.repo.mark_all_read(user_id)

    async def mark_one_read(self, notif_id: int, user_id: int) -> None:
        notif = await self.repo.get_by_id(notif_id)
        if notif and notif.user_id == user_id:
            notif.is_read = True
            await self.repo.session.flush()

    async def unread_count(self, user_id: int) -> int:
        return await self.repo.unread_count(user_id)
