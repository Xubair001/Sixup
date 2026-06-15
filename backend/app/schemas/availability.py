from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CreatePollRequest(BaseModel):
    match_id: int
    deadline: datetime | None = None


class SubmitAvailabilityRequest(BaseModel):
    status: str  # available / unavailable / maybe


class PollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    match_id: int
    deadline: datetime | None
    created_at: datetime


class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    poll_id: int
    user_id: int
    status: str
    responded_at: datetime


class PollWithResponses(BaseModel):
    poll: PollResponse
    responses: list[AvailabilityResponse]
    available: int
    unavailable: int
    maybe: int
