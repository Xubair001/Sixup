from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match
from app.models.innings import Innings
from app.models.batting_pair import BattingPair
from app.models.ball import Ball
from app.repositories.base import BaseRepository


class MatchRepository(BaseRepository[Match]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Match, session)

    async def get_by_short_code(self, code: str) -> Match | None:
        result = await self.session.execute(
            select(Match).where(Match.short_code == code.upper())
        )
        return result.scalar_one_or_none()

    async def get_team_matches(self, team_id: int) -> list[Match]:
        result = await self.session.execute(
            select(Match)
            .where((Match.team_home_id == team_id) | (Match.team_away_id == team_id))
            .order_by(Match.date.desc())
        )
        return list(result.scalars().all())

    async def update_status(self, match_id: int, status: str) -> None:
        await self.session.execute(
            update(Match).where(Match.id == match_id).values(status=status)
        )
        await self.session.flush()


class InningsRepository(BaseRepository[Innings]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Innings, session)

    async def get_by_match(self, match_id: int) -> list[Innings]:
        result = await self.session.execute(
            select(Innings).where(Innings.match_id == match_id).order_by(Innings.id)
        )
        return list(result.scalars().all())

    async def get_by_match_and_team(self, match_id: int, batting_team_id: int) -> Innings | None:
        result = await self.session.execute(
            select(Innings).where(
                Innings.match_id == match_id,
                Innings.batting_team_id == batting_team_id,
            )
        )
        return result.scalar_one_or_none()


class BattingPairRepository(BaseRepository[BattingPair]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(BattingPair, session)

    async def get_by_innings(self, innings_id: int) -> list[BattingPair]:
        result = await self.session.execute(
            select(BattingPair)
            .where(BattingPair.innings_id == innings_id)
            .order_by(BattingPair.pair_number)
        )
        return list(result.scalars().all())


class BallRepository(BaseRepository[Ball]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Ball, session)

    async def get_by_innings(self, innings_id: int) -> list[Ball]:
        result = await self.session.execute(
            select(Ball)
            .where(Ball.innings_id == innings_id)
            .order_by(Ball.over_number, Ball.ball_number)
        )
        return list(result.scalars().all())

    async def get_recent(self, innings_id: int, limit: int = 3) -> list[Ball]:
        result = await self.session.execute(
            select(Ball)
            .where(Ball.innings_id == innings_id)
            .order_by(Ball.id.desc())
            .limit(limit)
        )
        return list(reversed(result.scalars().all()))

    async def get_balls_this_over(self, innings_id: int, over_number: int) -> list[Ball]:
        result = await self.session.execute(
            select(Ball).where(
                Ball.innings_id == innings_id,
                Ball.over_number == over_number,
                Ball.is_wide.is_(False),
                Ball.is_no_ball.is_(False),
            )
        )
        return list(result.scalars().all())
