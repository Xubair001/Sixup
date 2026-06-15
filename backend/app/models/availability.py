from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AvailabilityPoll(Base):
    __tablename__ = "availability_polls"

    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), unique=True, nullable=False)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    responses: Mapped[list[PlayerAvailability]] = relationship(
        "PlayerAvailability", back_populates="poll", cascade="all, delete-orphan"
    )


class PlayerAvailability(Base):
    __tablename__ = "player_availability"
    __table_args__ = (UniqueConstraint("poll_id", "user_id", name="uq_player_availability"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("availability_polls.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="maybe", nullable=False)
    responded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    poll: Mapped[AvailabilityPoll] = relationship("AvailabilityPoll", back_populates="responses")
