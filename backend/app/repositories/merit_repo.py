from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.merit_point import MeritPoint
from app.repositories.base import BaseRepository


class MeritPointRepository(BaseRepository[MeritPoint]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(MeritPoint, session)

    async def get_by_user(self, user_id: int) -> list[MeritPoint]:
        result = await self.session.execute(
            select(MeritPoint)
            .where(MeritPoint.user_id == user_id)
            .order_by(MeritPoint.created_at.desc())
        )
        return list(result.scalars())

    async def get_by_match(self, match_id: int) -> list[MeritPoint]:
        result = await self.session.execute(
            select(MeritPoint).where(MeritPoint.match_id == match_id)
        )
        return list(result.scalars())
