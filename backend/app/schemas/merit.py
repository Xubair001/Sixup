from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AwardMeritRequest(BaseModel):
    user_id: int
    match_id: int | None = None
    type: str  # merit / demerit
    reason: str | None = None
    points: int


class MeritResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    match_id: int | None
    type: str
    reason: str | None
    points: int
    awarded_by: int
    created_at: datetime


class PlayerMeritSummary(BaseModel):
    user_id: int
    total_merit: int
    total_demerit: int
    net: int
    entries: list[MeritResponse]
