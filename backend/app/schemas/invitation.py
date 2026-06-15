from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SendInvitationRequest(BaseModel):
    username_or_public_id: str = Field(..., min_length=1, max_length=50)
    message: str | None = Field(None, max_length=200)


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    team_name: str = ""
    inviter_username: str = ""
    invitee_username: str = ""
    invitee_display_name: str = ""
    status: str
    message: str | None
    created_at: datetime
    expires_at: datetime | None

    @classmethod
    def from_invite(cls, inv: object) -> "InvitationResponse":
        return cls(
            id=inv.id,  # type: ignore[attr-defined]
            team_id=inv.team_id,  # type: ignore[attr-defined]
            team_name=inv.team.name if inv.team else "",  # type: ignore[attr-defined]
            inviter_username=inv.inviter.username if inv.inviter else "",  # type: ignore[attr-defined]
            invitee_username=inv.invitee.username if inv.invitee else "",  # type: ignore[attr-defined]
            invitee_display_name=inv.invitee.profile.display_name if inv.invitee and inv.invitee.profile else "",  # type: ignore[attr-defined]
            status=inv.status,  # type: ignore[attr-defined]
            message=inv.message,  # type: ignore[attr-defined]
            created_at=inv.created_at,  # type: ignore[attr-defined]
            expires_at=inv.expires_at,  # type: ignore[attr-defined]
        )
