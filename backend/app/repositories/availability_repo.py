from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.availability import AvailabilityPoll, PlayerAvailability
from app.repositories.base import BaseRepository


class AvailabilityPollRepository(BaseRepository[AvailabilityPoll]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(AvailabilityPoll, session)

    async def get_by_match(self, match_id: int) -> AvailabilityPoll | None:
        result = await self.session.execute(
            select(AvailabilityPoll).where(AvailabilityPoll.match_id == match_id)
        )
        return result.scalar_one_or_none()


class PlayerAvailabilityRepository(BaseRepository[PlayerAvailability]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(PlayerAvailability, session)

    async def get_by_poll_and_user(self, poll_id: int, user_id: int) -> PlayerAvailability | None:
        result = await self.session.execute(
            select(PlayerAvailability).where(
                PlayerAvailability.poll_id == poll_id,
                PlayerAvailability.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_poll(self, poll_id: int) -> list[PlayerAvailability]:
        result = await self.session.execute(
            select(PlayerAvailability).where(PlayerAvailability.poll_id == poll_id)
        )
        return list(result.scalars())
