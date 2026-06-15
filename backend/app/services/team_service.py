import re

from loguru import logger

from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.models.team import Team
from app.models.team_member import TeamMember
from app.repositories.team_member_repo import TeamMemberRepository
from app.repositories.team_repo import TeamRepository
from app.schemas.team import TeamCreate, TeamUpdate
from app.services.base import BaseService


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug.strip("-")


class TeamService(BaseService[TeamRepository]):
    def __init__(self, team_repo: TeamRepository, member_repo: TeamMemberRepository) -> None:
        super().__init__(team_repo)
        self.member_repo = member_repo

    async def create(self, creator_id: int, data: TeamCreate) -> Team:
        slug = _slugify(data.name)
        base_slug = slug
        counter = 1
        while await self.repo.slug_exists(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        from app.core.avatar import generate_team_logo
        logo_url = generate_team_logo(slug, data.name)

        team = Team(name=data.name, slug=slug, color=data.color, logo_url=logo_url, created_by=creator_id)
        team = await self.repo.create(team)

        owner = TeamMember(team_id=team.id, user_id=creator_id, role="owner")
        await self.member_repo.create(owner)

        logger.info("Team '{name}' created by user {uid}", name=team.name, uid=creator_id)
        return team

    async def get_team(self, team_id: int) -> Team:
        team = await self.repo.get_with_members(team_id)
        if not team:
            raise NotFoundError(f"Team {team_id} not found")
        return team

    async def get_user_teams(self, user_id: int) -> list[Team]:
        return await self.repo.get_teams_for_user(user_id)

    async def update(self, team_id: int, user_id: int, data: TeamUpdate) -> Team:
        await self._assert_can_manage(team_id, user_id)
        team = await self.repo.get_by_id(team_id)
        if not team:
            raise NotFoundError(f"Team {team_id} not found")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(team, field, value)
        await self.repo.session.flush()
        return team

    async def remove_member(self, team_id: int, requester_id: int, target_user_id: int) -> None:
        membership = await self.member_repo.get_membership(team_id, requester_id)
        if not membership or membership.role not in ("owner", "captain"):
            raise AuthorizationError("Only the owner or captain can remove members")

        if requester_id == target_user_id:
            raise ConflictError("Use 'leave team' to remove yourself")

        target = await self.member_repo.get_membership(team_id, target_user_id)
        if not target:
            raise NotFoundError("Player is not a member of this team")
        if target.role == "owner":
            raise AuthorizationError("Cannot remove the team owner")

        await self.member_repo.delete(target)
        logger.info("User {target} removed from team {team} by {req}", target=target_user_id, team=team_id, req=requester_id)

    async def leave_team(self, team_id: int, user_id: int) -> None:
        membership = await self.member_repo.get_membership(team_id, user_id)
        if not membership:
            raise NotFoundError("You are not a member of this team")
        if membership.role == "owner":
            raise ConflictError("Transfer ownership before leaving the team")
        await self.member_repo.delete(membership)

    async def update_member_status(self, team_id: int, requester_id: int, target_user_id: int, status: str) -> TeamMember:
        await self._assert_can_manage(team_id, requester_id)
        target = await self.member_repo.get_membership(team_id, target_user_id)
        if not target:
            raise NotFoundError("Player is not a member of this team")
        target.status = status
        await self.member_repo.session.flush()
        logger.info("User {target} status set to {status} in team {team}", target=target_user_id, status=status, team=team_id)
        return target

    async def update_member_role(self, team_id: int, requester_id: int, target_user_id: int, role: str) -> TeamMember:
        await self._assert_can_manage(team_id, requester_id, owner_only=True)
        target = await self.member_repo.get_membership(team_id, target_user_id)
        if not target:
            raise NotFoundError("Player is not a member of this team")
        target.role = role
        await self.member_repo.session.flush()
        return target

    async def _assert_can_manage(self, team_id: int, user_id: int, owner_only: bool = False) -> None:
        membership = await self.member_repo.get_membership(team_id, user_id)
        allowed = ("owner",) if owner_only else ("owner", "captain")
        if not membership or membership.role not in allowed:
            raise AuthorizationError("Insufficient team role to perform this action")
