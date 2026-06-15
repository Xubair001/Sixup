from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CreateMatchRequest(BaseModel):
    team_home_id: int
    team_away_id: int
    date: datetime | None = None
    venue: str | None = None
    visibility: str = "team_only"
    overs_per_innings: int = Field(default=16, ge=4, le=50)


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_home_id: int
    team_away_id: int
    date: datetime | None
    venue: str | None
    status: str
    short_code: str | None
    visibility: str
    scorer_user_id: int | None
    overs_per_innings: int


class BallInput(BaseModel):
    innings_id: int
    over_number: int
    ball_number: int
    batsman_user_id: int
    bowler_user_id: int
    physical_runs: int = Field(default=0, ge=0)
    net_zone: str = "none"
    is_wide: bool = False
    is_no_ball: bool = False
    is_wicket: bool = False
    dismissed_user_id: int | None = None


class BallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    innings_id: int
    over_number: int
    ball_number: int
    batsman_user_id: int
    bowler_user_id: int
    physical_runs: int
    net_zone: str
    bonus_runs: int
    is_wide: bool
    is_no_ball: bool
    is_wicket: bool
    dismissed_user_id: int | None
    total_runs: int


class InningsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    match_id: int
    batting_team_id: int
    total_runs: int
    total_wickets: int


class CreateInningsRequest(BaseModel):
    match_id: int
    batting_team_id: int


class BattingPairResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    innings_id: int
    pair_number: int
    player1_user_id: int
    player2_user_id: int
    runs: int
    wickets: int
    overs_from: int
    overs_to: int


class CreateBattingPairRequest(BaseModel):
    innings_id: int
    pair_number: int = Field(..., ge=1, le=4)
    player1_user_id: int
    player2_user_id: int
    overs_from: int
    overs_to: int
