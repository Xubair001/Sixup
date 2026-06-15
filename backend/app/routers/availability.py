from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.dependencies.auth import get_current_user_id
from app.schemas.availability import (
    AvailabilityResponse,
    CreatePollRequest,
    PollResponse,
    PollWithResponses,
    SubmitAvailabilityRequest,
)
from app.services.availability_service import AvailabilityService

router = APIRouter(prefix="/availability", tags=["Availability"])


def _svc(session: AsyncSession = Depends(get_session)) -> AvailabilityService:
    return AvailabilityService(session)


@router.post("/polls", response_model=PollResponse, status_code=201)
async def create_poll(
    data: CreatePollRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[AvailabilityService, Depends(_svc)],
):
    return await svc.create_poll(data.match_id, data.deadline, user_id)


@router.get("/polls/{match_id}", response_model=PollWithResponses)
async def get_poll(
    match_id: int,
    svc: Annotated[AvailabilityService, Depends(_svc)],
):
    return await svc.get_poll(match_id)


@router.post("/polls/{match_id}/respond", response_model=AvailabilityResponse)
async def respond(
    match_id: int,
    data: SubmitAvailabilityRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    svc: Annotated[AvailabilityService, Depends(_svc)],
):
    return await svc.respond(match_id, user_id, data.status)
