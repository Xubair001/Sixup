from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.dependencies.auth import get_current_user_id
from app.websockets.manager import ConnectionManager, get_manager
from app.schemas.match import (
    BallInput,
    BallResponse,
    BattingPairResponse,
    CreateBattingPairRequest,
    CreateInningsRequest,
    CreateMatchRequest,
    InningsResponse,
    MatchResponse,
)
from app.services.match_service import MatchService
from app.services.stats_service import StatsService

router = APIRouter(prefix="/matches", tags=["Matches"])


def _match_svc(
    session: AsyncSession = Depends(get_session),
    manager: ConnectionManager = Depends(get_manager),
) -> MatchService:
    return MatchService(session, ws_manager=manager)


def _stats_svc(session: AsyncSession = Depends(get_session)) -> StatsService:
    return StatsService(session)


@router.post("", response_model=MatchResponse, status_code=201)
async def create_match(
    data: CreateMatchRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.create_match(data, user_id)


@router.get("/team/{team_id}", response_model=list[MatchResponse])
async def team_matches(
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.get_team_matches(team_id, user_id)


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.get_match(match_id, user_id)


@router.post("/{match_id}/start", response_model=MatchResponse)
async def start_match(
    match_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.start_match(match_id, user_id)


@router.post("/{match_id}/complete", response_model=MatchResponse)
async def complete_match(
    match_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.complete_match(match_id)


@router.post("/innings", response_model=InningsResponse, status_code=201)
async def create_innings(
    data: CreateInningsRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.create_innings(data)


@router.post("/pairs", response_model=BattingPairResponse, status_code=201)
async def create_pair(
    data: CreateBattingPairRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.create_batting_pair(data)


@router.post("/balls", response_model=BallResponse, status_code=201)
async def record_ball(
    data: BallInput,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.record_ball(data, user_id)


@router.get("/innings/{innings_id}/recent-balls", response_model=list[BallResponse])
async def recent_balls(
    innings_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.get_recent_balls(innings_id, limit=3)


@router.delete("/balls/{ball_id}", status_code=204)
async def undo_ball(
    ball_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    await svc.undo_ball(ball_id, user_id)


@router.get("/{match_id}/scorecard")
async def scorecard(
    match_id: int,
    svc: Annotated[MatchService, Depends(_match_svc)],
):
    return await svc.get_match_scorecard(match_id)


@router.get("/{match_id}/stats")
async def match_stats(
    match_id: int,
    svc: Annotated[StatsService, Depends(_stats_svc)],
):
    return await svc.get_match_stats(match_id)


@router.get("/stats/leaderboard")
async def leaderboard(
    svc: Annotated[StatsService, Depends(_stats_svc)],
):
    return await svc.get_leaderboard()


@router.get("/stats/player/{user_id}")
async def player_stats(
    user_id: int,
    svc: Annotated[StatsService, Depends(_stats_svc)],
):
    batting = await svc.get_player_batting_stats(user_id)
    bowling = await svc.get_player_bowling_stats(user_id)
    return {"batting": batting, "bowling": bowling}
