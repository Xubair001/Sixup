from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")

    @field_validator("name")
    @classmethod
    def generate_slug_check(cls, v: str) -> str:
        return v


class TeamUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class TeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    color: str | None
    logo_url: str | None
    is_active: bool


class TeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role: str
    status: str = "available"
    jersey_number: int | None
    display_name: str = ""
    username: str = ""
    avatar_url: str | None = None

    @classmethod
    def from_member(cls, member: object) -> "TeamMemberResponse":
        return cls(
            id=member.id,  # type: ignore[attr-defined]
            user_id=member.user_id,  # type: ignore[attr-defined]
            role=member.role,  # type: ignore[attr-defined]
            status=getattr(member, "status", "available"),  # type: ignore[attr-defined]
            jersey_number=member.jersey_number,  # type: ignore[attr-defined]
            display_name=member.user.profile.display_name if member.user.profile else "",  # type: ignore[attr-defined]
            username=member.user.username,  # type: ignore[attr-defined]
            avatar_url=member.user.profile.avatar_url if member.user.profile else None,  # type: ignore[attr-defined]
        )


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(..., pattern=r"^(owner|captain|vice_captain|scorer|player)$")


class UpdateMemberStatusRequest(BaseModel):
    status: str = Field(..., pattern=r"^(playing|bench|available)$")
