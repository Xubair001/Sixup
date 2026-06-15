from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.notification_repo import NotificationRepository
from app.repositories.player_profile_repo import PlayerProfileRepository
from app.repositories.team_invitation_repo import TeamInvitationRepository
from app.repositories.team_member_repo import TeamMemberRepository
from app.repositories.team_repo import TeamRepository
from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService
from app.services.invitation_service import InvitationService
from app.services.notification_service import NotificationService
from app.services.player_service import PlayerService
from app.services.privacy_service import PrivacyService
from app.services.team_service import TeamService

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(UserRepository(session))


def get_player_service(session: SessionDep) -> PlayerService:
    return PlayerService(PlayerProfileRepository(session), UserRepository(session))


def get_team_service(session: SessionDep) -> TeamService:
    return TeamService(TeamRepository(session), TeamMemberRepository(session))


def get_notification_service(session: SessionDep) -> NotificationService:
    return NotificationService(NotificationRepository(session))


def get_invitation_service(session: SessionDep) -> InvitationService:
    notif_service = NotificationService(NotificationRepository(session))
    return InvitationService(
        TeamInvitationRepository(session),
        TeamMemberRepository(session),
        UserRepository(session),
        notif_service,
    )


def get_privacy_service(session: SessionDep) -> PrivacyService:
    return PrivacyService(TeamMemberRepository(session))
