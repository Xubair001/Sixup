from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.achievement import Achievement
    from app.models.merit_point import MeritPoint
    from app.models.notification import Notification
    from app.models.player_profile import PlayerProfile
    from app.models.team_invitation import TeamInvitation
    from app.models.team_member import TeamMember


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(8), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    system_role: Mapped[str] = mapped_column(String(20), default="player", nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    profile: Mapped[PlayerProfile | None] = relationship(
        "PlayerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    team_memberships: Mapped[list[TeamMember]] = relationship(
        "TeamMember", back_populates="user", cascade="all, delete-orphan"
    )
    sent_invitations: Mapped[list[TeamInvitation]] = relationship(
        "TeamInvitation", foreign_keys="TeamInvitation.inviter_id", back_populates="inviter"
    )
    received_invitations: Mapped[list[TeamInvitation]] = relationship(
        "TeamInvitation", foreign_keys="TeamInvitation.invitee_id", back_populates="invitee"
    )
    notifications: Mapped[list[Notification]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    achievements: Mapped[list[Achievement]] = relationship("Achievement", back_populates="user")
    merit_points: Mapped[list[MeritPoint]] = relationship(
        "MeritPoint", foreign_keys="MeritPoint.user_id", back_populates="user"
    )
