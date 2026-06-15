from __future__ import annotations

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthorizationError
from app.models.merit_point import MeritPoint
from app.repositories.merit_repo import MeritPointRepository
from app.repositories.team_member_repo import TeamMemberRepository
from app.services.base import BaseService


class MeritService(BaseService[MeritPointRepository]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(MeritPointRepository(session))
        self.member_repo = TeamMemberRepository(session)

    async def award(
        self,
        awarder_id: int,
        user_id: int,
        points: int,
        type_: str,
        reason: str | None,
        match_id: int | None,
        team_id: int,
    ) -> MeritPoint:
        awarder = await self.member_repo.get_membership(team_id, awarder_id)
        if not awarder or awarder.role not in ("owner", "captain", "vice_captain"):
            raise AuthorizationError("Only captains can award merit/demerit points")

        mp = MeritPoint(
            user_id=user_id,
            match_id=match_id,
            type=type_,
            reason=reason,
            points=points,
            awarded_by=awarder_id,
        )
        mp = await self.repo.create(mp)
        logger.info("Merit point {id} ({type_}) awarded to user {uid}", id=mp.id, type_=type_, uid=user_id)
        return mp

    async def get_player_summary(self, user_id: int) -> dict:
        entries = await self.repo.get_by_user(user_id)
        merit_total = sum(e.points for e in entries if e.type == "merit")
        demerit_total = sum(e.points for e in entries if e.type == "demerit")
        return {
            "user_id": user_id,
            "total_merit": merit_total,
            "total_demerit": demerit_total,
            "net": merit_total - demerit_total,
            "entries": entries,
        }

    async def get_match_merits(self, match_id: int) -> list[MeritPoint]:
        return await self.repo.get_by_match(match_id)
