from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.dependencies.auth import get_current_user_id
from app.schemas.merit import AwardMeritRequest, MeritResponse, PlayerMeritSummary
from app.services.merit_service import MeritService

router = APIRouter(prefix="/merit", tags=["Merit"])


def _svc(session: AsyncSession = Depends(get_session)) -> MeritService:
    return MeritService(session)


@router.post("", response_model=MeritResponse, status_code=201)
async def award_merit(
    data: AwardMeritRequest,
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[MeritService, Depends(_svc)],
):
    return await svc.award(
        awarder_id=user_id,
        user_id=data.user_id,
        points=data.points,
        type_=data.type,
        reason=data.reason,
        match_id=data.match_id,
        team_id=team_id,
    )


@router.get("/player/{user_id}", response_model=PlayerMeritSummary)
async def player_summary(
    user_id: int,
    svc: Annotated[MeritService, Depends(_svc)],
):
    return await svc.get_player_summary(user_id)


@router.get("/match/{match_id}", response_model=list[MeritResponse])
async def match_merits(
    match_id: int,
    svc: Annotated[MeritService, Depends(_svc)],
):
    return await svc.get_match_merits(match_id)
