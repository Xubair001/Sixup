from datetime import datetime, timedelta, timezone

from loguru import logger

from app.core.cricket_rules import RULES
from app.core.exceptions import (
    AuthorizationError,
    ConflictError,
    InviteCooldownError,
    InvitationExpiredError,
    NotFoundError,
    TeamLimitReachedError,
)
from app.models.team_invitation import TeamInvitation
from app.models.team_member import TeamMember
from app.repositories.team_invitation_repo import TeamInvitationRepository
from app.repositories.team_member_repo import TeamMemberRepository
from app.repositories.user_repo import UserRepository
from app.services.base import BaseService
from app.services.notification_service import NotificationService


class InvitationService(BaseService[TeamInvitationRepository]):
    def __init__(
        self,
        invite_repo: TeamInvitationRepository,
        member_repo: TeamMemberRepository,
        user_repo: UserRepository,
        notification_service: NotificationService,
    ) -> None:
        super().__init__(invite_repo)
        self.member_repo = member_repo
        self.user_repo = user_repo
        self.notification_service = notification_service

    async def send_invite(
        self,
        team_id: int,
        inviter_id: int,
        username_or_public_id: str,
        message: str | None = None,
    ) -> TeamInvitation:
        inviter_membership = await self.member_repo.get_membership(team_id, inviter_id)
        if not inviter_membership or inviter_membership.role not in ("owner", "captain"):
            raise AuthorizationError("Only the team owner or captain can send invitations")

        invitee = await self.user_repo.get_by_username(username_or_public_id.lower().lstrip("@"))
        if not invitee:
            invitee = await self.user_repo.get_by_public_id(username_or_public_id.lstrip("#"))
        if not invitee or not invitee.is_active:
            raise NotFoundError(f"Player '{username_or_public_id}' not found")

        if await self.member_repo.get_membership(team_id, invitee.id):
            raise ConflictError("Player is already a member of this team")

        if await self.repo.get_pending(team_id, invitee.id):
            raise ConflictError("An invitation is already pending for this player")

        team_count = await self.member_repo.get_user_team_count(invitee.id)
        if team_count >= RULES.MAX_TEAMS_PER_PLAYER:
            raise TeamLimitReachedError(f"Player has reached the maximum of {RULES.MAX_TEAMS_PER_PLAYER} teams")

        last_declined = await self.repo.get_last_declined(team_id, invitee.id)
        if last_declined and last_declined.responded_at:
            cooldown_end = last_declined.responded_at + timedelta(days=RULES.INVITE_COOLDOWN_DAYS)
            if datetime.now(timezone.utc) < cooldown_end:
                raise InviteCooldownError(
                    f"Cannot re-invite within {RULES.INVITE_COOLDOWN_DAYS} days of a declined invite"
                )

        invite = TeamInvitation(
            team_id=team_id,
            inviter_id=inviter_id,
            invitee_id=invitee.id,
            message=message,
            status="pending",
            expires_at=datetime.now(timezone.utc) + timedelta(days=RULES.INVITE_EXPIRY_DAYS),
        )
        invite = await self.repo.create(invite)

        await self.notification_service.create(
            user_id=invitee.id,
            type="team_invite",
            title="New team invitation",
            body=f"You've been invited to join a team",
            payload={"team_id": team_id, "invitation_id": invite.id},
        )
        logger.info("Invite sent to user {uid} for team {team}", uid=invitee.id, team=team_id)
        return invite

    async def respond(self, invite_id: int, responder_id: int, accept: bool) -> TeamInvitation:
        invite = await self.repo.get_with_relations(invite_id)
        if not invite:
            raise NotFoundError(f"Invitation {invite_id} not found")
        if invite.invitee_id != responder_id:
            raise AuthorizationError("This invitation is not for you")
        if invite.status != "pending":
            raise ConflictError(f"Invitation is already {invite.status}")

        now = datetime.now(timezone.utc)
        if invite.expires_at and now > invite.expires_at:
            invite.status = "expired"
            await self.repo.session.flush()
            raise InvitationExpiredError("This invitation has expired")

        invite.status = "accepted" if accept else "declined"
        invite.responded_at = now

        if accept:
            member = TeamMember(team_id=invite.team_id, user_id=responder_id, role="player")
            self.repo.session.add(member)
            await self.notification_service.create(
                user_id=invite.inviter_id,
                type="invite_accepted",
                title="Invitation accepted",
                body=f"@{invite.invitee.username} accepted your team invitation",
                payload={"team_id": invite.team_id, "user_id": responder_id},
            )
        else:
            await self.notification_service.create(
                user_id=invite.inviter_id,
                type="invite_declined",
                title="Invitation declined",
                body=f"@{invite.invitee.username} declined your team invitation",
                payload={"team_id": invite.team_id},
            )

        await self.repo.session.flush()
        logger.info(
            "Invitation {id} {status} by user {uid}",
            id=invite_id,
            status=invite.status,
            uid=responder_id,
        )
        return invite

    async def expire_pending(self) -> int:
        count = await self.repo.expire_overdue()
        if count:
            logger.info("Expired {count} invitations", count=count)
        return count

    async def get_for_team(self, team_id: int, requester_id: int) -> list[TeamInvitation]:
        membership = await self.member_repo.get_membership(team_id, requester_id)
        if not membership or membership.role not in ("owner", "captain"):
            raise AuthorizationError("Only the team owner or captain can view invitations")
        return await self.repo.get_for_team(team_id)

    async def get_for_user(self, user_id: int) -> list[TeamInvitation]:
        return await self.repo.get_for_user(user_id)
