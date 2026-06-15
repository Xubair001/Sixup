from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.team import Team
from app.models.team_member import TeamMember
from app.repositories.base import BaseRepository


class TeamRepository(BaseRepository[Team]):
    def __init__(self, session) -> None:
        super().__init__(Team, session)

    async def get_by_slug(self, slug: str) -> Team | None:
        result = await self.session.execute(select(Team).where(Team.slug == slug))
        return result.scalar_one_or_none()

    async def get_with_members(self, team_id: int) -> Team | None:
        result = await self.session.execute(
            select(Team)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user).selectinload(
                    __import__("app.models.user", fromlist=["User"]).User.profile
                )
            )
            .where(Team.id == team_id)
        )
        return result.scalar_one_or_none()

    async def get_teams_for_user(self, user_id: int) -> list[Team]:
        result = await self.session.execute(
            select(Team)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .where(TeamMember.user_id == user_id, Team.is_active.is_(True))
        )
        return list(result.scalars().all())

    async def slug_exists(self, slug: str) -> bool:
        result = await self.session.execute(select(Team.id).where(Team.slug == slug))
        return result.scalar_one_or_none() is not None
