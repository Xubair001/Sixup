from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user_id
from app.dependencies.services import get_invitation_service
from app.schemas.invitation import InvitationResponse, SendInvitationRequest
from app.services.invitation_service import InvitationService

router = APIRouter(tags=["Invitations"])


@router.post("/teams/{team_id}/invitations", response_model=InvitationResponse, status_code=201)
async def send_invitation(
    team_id: int,
    data: SendInvitationRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[InvitationService, Depends(get_invitation_service)],
):
    invite = await service.send_invite(team_id, user_id, data.username_or_public_id, data.message)
    return InvitationResponse.from_invite(await service.repo.get_with_relations(invite.id))


@router.get("/teams/{team_id}/invitations", response_model=list[InvitationResponse])
async def team_invitations(
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[InvitationService, Depends(get_invitation_service)],
):
    invites = await service.get_for_team(team_id, user_id)
    return [InvitationResponse.from_invite(i) for i in invites]


@router.get("/players/me/invitations", response_model=list[InvitationResponse])
async def my_invitations(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[InvitationService, Depends(get_invitation_service)],
):
    invites = await service.get_for_user(user_id)
    return [InvitationResponse.from_invite(i) for i in invites]


@router.post("/invitations/{invite_id}/accept", response_model=InvitationResponse)
async def accept_invitation(
    invite_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[InvitationService, Depends(get_invitation_service)],
):
    invite = await service.respond(invite_id, user_id, accept=True)
    return InvitationResponse.from_invite(await service.repo.get_with_relations(invite.id))


@router.post("/invitations/{invite_id}/decline", response_model=InvitationResponse)
async def decline_invitation(
    invite_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[InvitationService, Depends(get_invitation_service)],
):
    invite = await service.respond(invite_id, user_id, accept=False)
    return InvitationResponse.from_invite(await service.repo.get_with_relations(invite.id))
