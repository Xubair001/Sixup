from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ball import Ball
    from app.models.batting_pair import BattingPair
    from app.models.match import Match


class Innings(Base):
    __tablename__ = "innings"

    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    batting_team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    innings_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_wickets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    match: Mapped[Match] = relationship("Match", back_populates="innings")
    batting_pairs: Mapped[list[BattingPair]] = relationship(
        "BattingPair", back_populates="innings", cascade="all, delete-orphan"
    )
    balls: Mapped[list[Ball]] = relationship(
        "Ball", back_populates="innings", cascade="all, delete-orphan"
    )
