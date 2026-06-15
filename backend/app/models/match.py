from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.innings import Innings


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    team_home_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    team_away_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    tournament_id: Mapped[int | None] = mapped_column(ForeignKey("tournaments.id"))
    season_id: Mapped[int | None] = mapped_column(ForeignKey("seasons.id"))
    date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    venue: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False)
    scorer_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    visibility: Mapped[str] = mapped_column(String(20), default="team_only", nullable=False)
    short_code: Mapped[str | None] = mapped_column(String(8), unique=True, index=True)
    overs_per_innings: Mapped[int] = mapped_column(Integer, default=16, nullable=False, server_default="16")
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    innings: Mapped[list[Innings]] = relationship(
        "Innings", back_populates="match", cascade="all, delete-orphan"
    )
