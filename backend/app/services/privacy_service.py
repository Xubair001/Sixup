from app.core.exceptions import AuthorizationError
from app.repositories.team_member_repo import TeamMemberRepository


class PrivacyService:
    def __init__(self, team_member_repo: TeamMemberRepository) -> None:
        self.team_member_repo = team_member_repo

    async def can_view_player_stats(self, viewer_id: int, target_id: int) -> bool:
        if viewer_id == target_id:
            return True
        shared = await self.team_member_repo.get_shared_team_ids(viewer_id, target_id)
        return len(shared) > 0

    async def assert_can_view_stats(self, viewer_id: int, target_id: int) -> None:
        if not await self.can_view_player_stats(viewer_id, target_id):
            raise AuthorizationError("You do not have permission to view this player's stats")

    async def assert_team_role(
        self,
        user_id: int,
        team_id: int,
        allowed_roles: list[str],
    ) -> None:
        membership = await self.team_member_repo.get_membership(team_id, user_id)
        if not membership or membership.role not in allowed_roles:
            raise AuthorizationError(
                f"You need one of these roles to perform this action: {', '.join(allowed_roles)}"
            )
