from sqlalchemy import func, select

from app.models.team_member import TeamMember
from app.repositories.base import BaseRepository


class TeamMemberRepository(BaseRepository[TeamMember]):
    def __init__(self, session) -> None:
        super().__init__(TeamMember, session)

    async def get_membership(self, team_id: int, user_id: int) -> TeamMember | None:
        result = await self.session.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id, TeamMember.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_user_team_count(self, user_id: int) -> int:
        result = await self.session.execute(
            select(func.count()).where(TeamMember.user_id == user_id)
        )
        return result.scalar_one()

    async def get_team_user_ids(self, team_id: int) -> list[int]:
        result = await self.session.execute(
            select(TeamMember.user_id).where(TeamMember.team_id == team_id)
        )
        return list(result.scalars().all())

    async def get_shared_team_ids(self, user_a: int, user_b: int) -> list[int]:
        subq = select(TeamMember.team_id).where(TeamMember.user_id == user_b)
        result = await self.session.execute(
            select(TeamMember.team_id).where(
                TeamMember.user_id == user_a, TeamMember.team_id.in_(subq)
            )
        )
        return list(result.scalars().all())
