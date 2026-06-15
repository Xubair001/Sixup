from __future__ import annotations

from sqlalchemy import Integer, func, select
from sqlalchemy import cast as sa_cast
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ball import Ball
from app.models.innings import Innings
from app.models.match import Match


class StatsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_player_batting_stats(self, user_id: int) -> dict:
        result = await self.session.execute(
            select(
                func.count(Ball.id).label("balls_faced"),
                func.sum(Ball.physical_runs).label("physical_runs"),
                func.sum(Ball.bonus_runs).label("bonus_runs"),
                func.sum(Ball.total_runs).label("total_runs"),
                func.sum(sa_cast(Ball.is_wicket, Integer)).label("dismissals"),
            ).where(
                Ball.batsman_user_id == user_id,
                Ball.is_wide.is_(False),
                Ball.is_no_ball.is_(False),
            )
        )
        row = result.one()
        return {
            "user_id": user_id,
            "balls_faced": row.balls_faced or 0,
            "physical_runs": int(row.physical_runs or 0),
            "bonus_runs": int(row.bonus_runs or 0),
            "total_runs": int(row.total_runs or 0),
            "dismissals": int(row.dismissals or 0),
        }

    async def get_player_bowling_stats(self, user_id: int) -> dict:
        result = await self.session.execute(
            select(
                func.count(Ball.id).label("balls_bowled"),
                func.sum(Ball.total_runs).label("runs_conceded"),
                func.sum(sa_cast(Ball.is_wicket, Integer)).label("wickets"),
            ).where(
                Ball.bowler_user_id == user_id,
                Ball.is_wide.is_(False),
                Ball.is_no_ball.is_(False),
            )
        )
        row = result.one()
        balls = row.balls_bowled or 0
        overs = f"{balls // 6}.{balls % 6}"
        runs = int(row.runs_conceded or 0)
        wickets = int(row.wickets or 0)
        economy = round(runs / (balls / 6), 2) if balls >= 6 else None
        return {
            "user_id": user_id,
            "overs_bowled": overs,
            "runs_conceded": runs,
            "wickets": wickets,
            "economy": economy,
        }

    async def get_leaderboard(self, team_ids: list[int] | None = None) -> dict:
        query = select(
            Ball.batsman_user_id,
            func.sum(Ball.total_runs).label("runs"),
        ).where(
            Ball.is_wide.is_(False),
            Ball.is_no_ball.is_(False),
        ).group_by(Ball.batsman_user_id).order_by(func.sum(Ball.total_runs).desc()).limit(10)

        result = await self.session.execute(query)
        top_batters = [{"user_id": r.batsman_user_id, "runs": int(r.runs or 0)} for r in result]

        query2 = select(
            Ball.bowler_user_id,
            func.sum(sa_cast(Ball.is_wicket, Integer)).label("wickets"),
        ).where(
            Ball.is_wide.is_(False),
            Ball.is_no_ball.is_(False),
        ).group_by(Ball.bowler_user_id).order_by(func.sum(sa_cast(Ball.is_wicket, Integer)).desc()).limit(10)

        result2 = await self.session.execute(query2)
        top_bowlers = [{"user_id": r.bowler_user_id, "wickets": int(r.wickets or 0)} for r in result2]

        return {"top_batters": top_batters, "top_bowlers": top_bowlers}

    async def get_match_stats(self, match_id: int) -> dict:
        innings_result = await self.session.execute(
            select(Innings).where(Innings.match_id == match_id)
        )
        innings_list = list(innings_result.scalars())

        stats = []
        for innings in innings_list:
            result = await self.session.execute(
                select(
                    Ball.batsman_user_id,
                    func.sum(Ball.total_runs).label("runs"),
                    func.count(Ball.id).label("balls"),
                ).where(
                    Ball.innings_id == innings.id,
                    Ball.is_wide.is_(False),
                    Ball.is_no_ball.is_(False),
                ).group_by(Ball.batsman_user_id).order_by(func.sum(Ball.total_runs).desc())
            )
            batting = [{"user_id": r.batsman_user_id, "runs": int(r.runs or 0), "balls": r.balls} for r in result]

            result2 = await self.session.execute(
                select(
                    Ball.bowler_user_id,
                    func.sum(sa_cast(Ball.is_wicket, Integer)).label("wickets"),
                    func.count(Ball.id).label("balls"),
                    func.sum(Ball.total_runs).label("runs_conceded"),
                ).where(
                    Ball.innings_id == innings.id,
                    Ball.is_wide.is_(False),
                    Ball.is_no_ball.is_(False),
                ).group_by(Ball.bowler_user_id)
            )
            bowling = [
                {
                    "user_id": r.bowler_user_id,
                    "wickets": int(r.wickets or 0),
                    "balls": r.balls,
                    "runs_conceded": int(r.runs_conceded or 0),
                }
                for r in result2
            ]

            # Latest over/ball for auto-tracking
            latest_result = await self.session.execute(
                select(Ball.over_number, Ball.ball_number)
                .where(Ball.innings_id == innings.id)
                .order_by(Ball.id.desc())
                .limit(1)
            )
            latest = latest_result.first()
            if latest:
                next_ball = latest.ball_number + 1
                next_over = latest.over_number
                if next_ball > 6:
                    next_ball = 1
                    next_over = latest.over_number + 1
                current_over = next_over
                current_ball = next_ball
            else:
                current_over = 1
                current_ball = 1

            stats.append({
                "innings_id": innings.id,
                "batting_team_id": innings.batting_team_id,
                "total_runs": innings.total_runs,
                "total_wickets": innings.total_wickets,
                "batting": batting,
                "bowling": bowling,
                "current_over": current_over,
                "current_ball": current_ball,
            })

        # Best player awards across all innings in the match
        best_batsman = None
        best_bowler = None
        if stats:
            all_batting = [b for s in stats for b in s["batting"]]
            all_bowling = [b for s in stats for b in s["bowling"]]
            if all_batting:
                best_batsman = max(all_batting, key=lambda x: x["runs"])
            if all_bowling:
                best_bowler = max(all_bowling, key=lambda x: (x["wickets"], -x.get("runs_conceded", 999)))

        return {
            "match_id": match_id,
            "innings": stats,
            "best_batsman": best_batsman,
            "best_bowler": best_bowler,
        }
