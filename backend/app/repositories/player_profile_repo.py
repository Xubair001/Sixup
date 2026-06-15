from sqlalchemy import select

from app.models.player_profile import PlayerProfile
from app.repositories.base import BaseRepository


class PlayerProfileRepository(BaseRepository[PlayerProfile]):
    def __init__(self, session) -> None:
        super().__init__(PlayerProfile, session)

    async def get_by_user_id(self, user_id: int) -> PlayerProfile | None:
        result = await self.session.execute(
            select(PlayerProfile).where(PlayerProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()
