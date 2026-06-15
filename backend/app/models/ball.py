from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.innings import Innings


class Ball(Base):
    __tablename__ = "balls"

    id: Mapped[int] = mapped_column(primary_key=True)
    innings_id: Mapped[int] = mapped_column(ForeignKey("innings.id", ondelete="CASCADE"), nullable=False)
    over_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    ball_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    batsman_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    bowler_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    physical_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    net_zone: Mapped[str] = mapped_column(String(20), default="none", nullable=False)
    bonus_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_wide: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_no_ball: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_wicket: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dismissed_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    total_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    innings: Mapped[Innings] = relationship("Innings", back_populates="balls")
