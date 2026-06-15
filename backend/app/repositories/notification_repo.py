from sqlalchemy import select, update

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, session) -> None:
        super().__init__(Notification, session)

    async def get_for_user(self, user_id: int, limit: int = 30, offset: int = 0) -> list[Notification]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.is_read.asc(), Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: int) -> None:
        await self.session.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await self.session.flush()

    async def unread_count(self, user_id: int) -> int:
        from sqlalchemy import func
        result = await self.session.execute(
            select(func.count()).where(
                Notification.user_id == user_id, Notification.is_read.is_(False)
            )
        )
        return result.scalar_one()
