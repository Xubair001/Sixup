from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.innings import Innings


class BattingPair(Base):
    __tablename__ = "batting_pairs"

    id: Mapped[int] = mapped_column(primary_key=True)
    innings_id: Mapped[int] = mapped_column(ForeignKey("innings.id", ondelete="CASCADE"), nullable=False)
    pair_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    player1_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    player2_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    wickets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    overs_from: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    overs_to: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    is_current: Mapped[bool] = mapped_column(default=False, nullable=False)

    innings: Mapped[Innings] = relationship("Innings", back_populates="batting_pairs")
