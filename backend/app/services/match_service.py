from __future__ import annotations

import secrets
import string

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cricket_rules import RULES
from app.core.exceptions import (
    AuthorizationError,
    InvalidScoringError,
    MatchNotLiveError,
    NotFoundError,
)
from app.models.ball import Ball
from app.models.batting_pair import BattingPair
from app.models.innings import Innings
from app.models.match import Match
from app.repositories.match_repo import (
    BallRepository,
    BattingPairRepository,
    InningsRepository,
    MatchRepository,
)
from app.repositories.team_member_repo import TeamMemberRepository
from app.schemas.match import (
    BallInput,
    CreateBattingPairRequest,
    CreateInningsRequest,
    CreateMatchRequest,
)
from app.repositories.notification_repo import NotificationRepository
from app.services.base import BaseService
from app.services.notification_service import NotificationService
from app.websockets.manager import ConnectionManager


class MatchService(BaseService[MatchRepository]):
    def __init__(self, session: AsyncSession, ws_manager: ConnectionManager | None = None) -> None:
        repo = MatchRepository(session)
        super().__init__(repo)
        self.session = session
        self.innings_repo = InningsRepository(session)
        self.pair_repo = BattingPairRepository(session)
        self.ball_repo = BallRepository(session)
        self.member_repo = TeamMemberRepository(session)
        self.ws_manager = ws_manager
        self.notif_service = NotificationService(NotificationRepository(session))

    async def _notify_teams(self, match: "Match", type: str, title: str, body: str) -> None:
        """Send a notification to every member of both teams in the match."""
        home_ids = await self.member_repo.get_team_user_ids(match.team_home_id)
        away_ids = await self.member_repo.get_team_user_ids(match.team_away_id)
        payload = {"match_id": match.id, "short_code": match.short_code}
        for uid in set(home_ids + away_ids):
            await self.notif_service.create(uid, type, title, body, payload)

    def _gen_short_code(self) -> str:
        chars = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(chars) for _ in range(6))

    async def create_match(self, data: CreateMatchRequest, creator_id: int) -> Match:
        member = await self.member_repo.get_membership(data.team_home_id, creator_id)
        if not member or member.role not in ("owner", "captain", "vice_captain"):
            raise AuthorizationError("Only team captains can create matches")

        for _ in range(10):
            code = self._gen_short_code()
            if not await self.repo.get_by_short_code(code):
                break

        match = Match(
            team_home_id=data.team_home_id,
            team_away_id=data.team_away_id,
            date=data.date,
            venue=data.venue,
            visibility=data.visibility,
            short_code=code,
            status="scheduled",
            overs_per_innings=data.overs_per_innings,
            created_by=creator_id,
        )
        match = await self.repo.create(match)
        logger.info("Match {id} created by user {uid}", id=match.id, uid=creator_id)
        await self._notify_teams(
            match, "match_scheduled",
            "Match Scheduled",
            f"A match has been scheduled. Code: #{match.short_code}",
        )
        return match

    async def start_match(self, match_id: int, scorer_user_id: int) -> Match:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise NotFoundError(f"Match {match_id} not found")
        if match.status != "scheduled":
            raise InvalidScoringError("Match is not in scheduled state")
        if match.created_by != scorer_user_id:
            raise AuthorizationError("Only the match creator can start the match")
        match.status = "live"
        match.scorer_user_id = scorer_user_id
        await self.session.flush()
        await self._notify_teams(
            match, "match_started",
            "Match Started ●",
            f"Match #{match.short_code} is now live!",
        )
        return match

    async def complete_match(self, match_id: int) -> Match:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise NotFoundError(f"Match {match_id} not found")
        match.status = "completed"
        await self.session.flush()
        await self._notify_teams(
            match, "match_completed",
            "Match Completed",
            f"Match #{match.short_code} has ended. Check the scorecard!",
        )
        return match

    async def create_innings(self, data: CreateInningsRequest) -> Innings:
        innings = Innings(
            match_id=data.match_id,
            batting_team_id=data.batting_team_id,
            total_runs=0,
            total_wickets=0,
        )
        return await self.innings_repo.create(innings)

    async def create_batting_pair(self, data: CreateBattingPairRequest) -> BattingPair:
        pair = BattingPair(
            innings_id=data.innings_id,
            pair_number=data.pair_number,
            player1_user_id=data.player1_user_id,
            player2_user_id=data.player2_user_id,
            runs=0,
            wickets=0,
            overs_from=data.overs_from,
            overs_to=data.overs_to,
        )
        return await self.pair_repo.create(pair)

    async def record_ball(self, data: BallInput, scorer_id: int) -> Ball:
        innings = await self.innings_repo.get_by_id(data.innings_id)
        if not innings:
            raise NotFoundError(f"Innings {data.innings_id} not found")

        match = await self.repo.get_by_id(innings.match_id)
        if not match:
            raise NotFoundError("Match not found")
        if match.status != "live":
            raise MatchNotLiveError()
        if match.scorer_user_id != scorer_id:
            raise AuthorizationError("Only the designated scorer can record balls")

        bonus = RULES.NET_BONUS.get(data.net_zone, 0)

        if data.is_wide:
            total = RULES.WIDE_RUNS
        elif data.is_no_ball:
            total = data.physical_runs + bonus + RULES.NO_BALL_RUNS
        elif data.is_wicket:
            total = data.physical_runs + bonus - RULES.WICKET_PENALTY
        else:
            total = data.physical_runs + bonus

        ball = Ball(
            innings_id=data.innings_id,
            over_number=data.over_number,
            ball_number=data.ball_number,
            batsman_user_id=data.batsman_user_id,
            bowler_user_id=data.bowler_user_id,
            physical_runs=data.physical_runs,
            net_zone=data.net_zone,
            bonus_runs=bonus,
            is_wide=data.is_wide,
            is_no_ball=data.is_no_ball,
            is_wicket=data.is_wicket,
            dismissed_user_id=data.dismissed_user_id,
            total_runs=total,
        )
        ball = await self.ball_repo.create(ball)

        innings.total_runs += total
        if data.is_wicket:
            innings.total_wickets += 1
        await self.session.flush()

        if self.ws_manager:
            await self.ws_manager.broadcast(innings.match_id, {
                "type": "ball",
                "match_id": innings.match_id,
                "innings_id": innings.id,
                "batting_team_id": innings.batting_team_id,
                "total_runs": innings.total_runs,
                "total_wickets": innings.total_wickets,
                "ball": {
                    "over": data.over_number,
                    "ball": data.ball_number,
                    "runs": total,
                    "is_wide": data.is_wide,
                    "is_no_ball": data.is_no_ball,
                    "is_wicket": data.is_wicket,
                },
            })

        return ball

    async def get_recent_balls(self, innings_id: int, limit: int = 3) -> list[Ball]:
        return await self.ball_repo.get_recent(innings_id, limit)

    async def undo_ball(self, ball_id: int, scorer_id: int) -> None:
        ball = await self.ball_repo.get_by_id(ball_id)
        if not ball:
            raise NotFoundError(f"Ball {ball_id} not found")
        innings = await self.innings_repo.get_by_id(ball.innings_id)
        if not innings:
            raise NotFoundError("Innings not found")
        match = await self.repo.get_by_id(innings.match_id)
        if not match:
            raise NotFoundError("Match not found")
        if match.scorer_user_id != scorer_id:
            raise AuthorizationError("Only the designated scorer can undo balls")
        if match.status != "live":
            raise MatchNotLiveError()

        # Reverse the effect on innings totals
        innings.total_runs -= ball.total_runs
        if ball.is_wicket:
            innings.total_wickets -= 1
        await self.ball_repo.delete(ball)
        await self.session.flush()
        logger.info("Ball {bid} undone from innings {iid}", bid=ball_id, iid=innings.id)

    async def get_match_scorecard(self, match_id: int) -> dict:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise NotFoundError(f"Match {match_id} not found")

        innings_list = await self.innings_repo.get_by_match(match_id)
        result: dict = {"match": match, "innings": []}

        for innings in innings_list:
            pairs = await self.pair_repo.get_by_innings(innings.id)
            balls = await self.ball_repo.get_by_innings(innings.id)
            result["innings"].append({"innings": innings, "pairs": pairs, "balls": balls})

        return result

    async def get_team_matches(self, team_id: int, viewer_id: int) -> list[Match]:
        member = await self.member_repo.get_membership(team_id, viewer_id)
        if not member:
            raise AuthorizationError("You are not a member of this team")
        return await self.repo.get_team_matches(team_id)

    async def get_match(self, match_id: int, viewer_id: int) -> Match:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise NotFoundError(f"Match {match_id} not found")
        # Check viewer belongs to one of the teams in the match
        home_member = await self.member_repo.get_membership(match.team_home_id, viewer_id)
        away_member = await self.member_repo.get_membership(match.team_away_id, viewer_id)
        if not home_member and not away_member:
            raise AuthorizationError("You do not have access to this match")
        return match
