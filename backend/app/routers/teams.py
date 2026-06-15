from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user_id
from app.dependencies.services import get_team_service
from app.schemas.common import MessageResponse
from app.schemas.team import TeamCreate, TeamMemberResponse, TeamResponse, TeamUpdate, UpdateMemberRoleRequest, UpdateMemberStatusRequest
from app.services.team_service import TeamService

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("", response_model=TeamResponse, status_code=201)
async def create_team(
    data: TeamCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    return await service.create(user_id, data)


@router.get("/mine", response_model=list[TeamResponse])
async def my_teams(
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    return await service.get_user_teams(user_id)


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    return await service.get_team(team_id)


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    data: TeamUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    return await service.update(team_id, user_id, data)


@router.get("/{team_id}/members", response_model=list[TeamMemberResponse])
async def get_members(
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    team = await service.get_team(team_id)
    return [TeamMemberResponse.from_member(m) for m in team.members]


@router.patch("/{team_id}/members/{target_user_id}/status", response_model=MessageResponse)
async def update_member_status(
    team_id: int,
    target_user_id: int,
    data: UpdateMemberStatusRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    await service.update_member_status(team_id, user_id, target_user_id, data.status)
    return MessageResponse(message="Status updated successfully")


@router.patch("/{team_id}/members/{target_user_id}/role", response_model=MessageResponse)
async def update_member_role(
    team_id: int,
    target_user_id: int,
    data: UpdateMemberRoleRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    await service.update_member_role(team_id, user_id, target_user_id, data.role)
    return MessageResponse(message="Role updated successfully")


@router.delete("/{team_id}/members/{target_user_id}", response_model=MessageResponse)
async def remove_member(
    team_id: int,
    target_user_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    await service.remove_member(team_id, user_id, target_user_id)
    return MessageResponse(message="Member removed")


@router.post("/{team_id}/leave", response_model=MessageResponse)
async def leave_team(
    team_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    service: Annotated[TeamService, Depends(get_team_service)],
):
    await service.leave_team(team_id, user_id)
    return MessageResponse(message="You have left the team")
