from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.cricket_rules import RULES
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    jersey_number: Mapped[int | None] = mapped_column(SmallInteger)
    bio: Mapped[str | None] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(20))
    batting_style: Mapped[str | None] = mapped_column(String(20))
    bowling_style: Mapped[str | None] = mapped_column(String(50))
    privacy_level: Mapped[str] = mapped_column(String(20), default="team_only", nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=RULES.DEFAULT_PLAYER_RATING, nullable=False)
    is_looking_for_team: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    location: Mapped[str | None] = mapped_column(String(100))

    user: Mapped[User] = relationship("User", back_populates="profile")
