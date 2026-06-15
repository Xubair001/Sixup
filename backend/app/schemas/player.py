from pydantic import BaseModel, ConfigDict, Field


class PublicProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    public_id: str
    username: str
    display_name: str
    avatar_url: str | None


class PlayerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    display_name: str
    avatar_url: str | None
    jersey_number: int | None
    bio: str | None
    batting_style: str | None
    bowling_style: str | None
    privacy_level: str
    rating: int
    is_looking_for_team: bool
    location: str | None


class PlayerProfileUpdate(BaseModel):
    display_name: str | None = Field(None, min_length=2, max_length=100)
    jersey_number: int | None = Field(None, ge=0, le=99)
    bio: str | None = Field(None, max_length=160)
    batting_style: str | None = None
    bowling_style: str | None = None
    privacy_level: str | None = None
    is_looking_for_team: bool | None = None
    location: str | None = Field(None, max_length=100)


class PlayerSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    public_id: str
    username: str
    display_name: str
    avatar_url: str | None
