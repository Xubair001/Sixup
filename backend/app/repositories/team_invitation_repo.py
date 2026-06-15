from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.team import Team
from app.models.team_invitation import TeamInvitation
from app.models.user import User
from app.repositories.base import BaseRepository


class TeamInvitationRepository(BaseRepository[TeamInvitation]):
    def __init__(self, session) -> None:
        super().__init__(TeamInvitation, session)

    async def get_pending(self, team_id: int, invitee_id: int) -> TeamInvitation | None:
        result = await self.session.execute(
            select(TeamInvitation).where(
                TeamInvitation.team_id == team_id,
                TeamInvitation.invitee_id == invitee_id,
                TeamInvitation.status == "pending",
            )
        )
        return result.scalar_one_or_none()

    async def get_last_declined(self, team_id: int, invitee_id: int) -> TeamInvitation | None:
        result = await self.session.execute(
            select(TeamInvitation)
            .where(
                TeamInvitation.team_id == team_id,
                TeamInvitation.invitee_id == invitee_id,
                TeamInvitation.status == "declined",
            )
            .order_by(TeamInvitation.responded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_with_relations(self, invite_id: int) -> TeamInvitation | None:
        result = await self.session.execute(
            select(TeamInvitation)
            .options(
                selectinload(TeamInvitation.team),
                selectinload(TeamInvitation.inviter),
                selectinload(TeamInvitation.invitee).selectinload(User.profile),
            )
            .where(TeamInvitation.id == invite_id)
        )
        return result.scalar_one_or_none()

    async def get_for_team(self, team_id: int, status: str = "pending") -> list[TeamInvitation]:
        result = await self.session.execute(
            select(TeamInvitation)
            .options(
                selectinload(TeamInvitation.invitee).selectinload(User.profile),
                selectinload(TeamInvitation.inviter),
            )
            .where(TeamInvitation.team_id == team_id, TeamInvitation.status == status)
        )
        return list(result.scalars().all())

    async def get_for_user(self, user_id: int, status: str = "pending") -> list[TeamInvitation]:
        result = await self.session.execute(
            select(TeamInvitation)
            .options(
                selectinload(TeamInvitation.team),
                selectinload(TeamInvitation.inviter),
                selectinload(TeamInvitation.invitee).selectinload(User.profile),
            )
            .where(TeamInvitation.invitee_id == user_id, TeamInvitation.status == status)
        )
        return list(result.scalars().all())

    async def expire_overdue(self) -> int:
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            update(TeamInvitation)
            .where(
                TeamInvitation.status == "pending",
                TeamInvitation.expires_at < now,
            )
            .values(status="expired")
        )
        await self.session.flush()
        return result.rowcount
