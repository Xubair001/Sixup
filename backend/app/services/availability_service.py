from __future__ import annotations

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.availability import AvailabilityPoll, PlayerAvailability
from app.repositories.availability_repo import (
    AvailabilityPollRepository,
    PlayerAvailabilityRepository,
)
from app.repositories.match_repo import MatchRepository
from app.repositories.notification_repo import NotificationRepository
from app.repositories.team_member_repo import TeamMemberRepository
from app.services.base import BaseService
from app.services.notification_service import NotificationService


class AvailabilityService(BaseService[AvailabilityPollRepository]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(AvailabilityPollRepository(session))
        self.response_repo = PlayerAvailabilityRepository(session)
        self.match_repo = MatchRepository(session)
        self.member_repo = TeamMemberRepository(session)
        self.notif_service = NotificationService(NotificationRepository(session))

    async def create_poll(self, match_id: int, deadline, creator_id: int) -> AvailabilityPoll:
        existing = await self.repo.get_by_match(match_id)
        if existing:
            raise ConflictError(f"Poll already exists for match {match_id}")

        poll = AvailabilityPoll(match_id=match_id, deadline=deadline, created_by=creator_id)
        poll = await self.repo.create(poll)
        logger.info("Availability poll {id} created for match {mid}", id=poll.id, mid=match_id)

        match = await self.match_repo.get_by_id(match_id)
        if match:
            home_ids = await self.member_repo.get_team_user_ids(match.team_home_id)
            away_ids = await self.member_repo.get_team_user_ids(match.team_away_id)
            for uid in set(home_ids + away_ids):
                await self.notif_service.create(
                    uid, "availability_poll",
                    "Availability Poll",
                    f"Are you available for match #{match.short_code}? Please respond.",
                    {"match_id": match_id, "poll_id": poll.id},
                )

        return poll

    async def get_poll(self, match_id: int) -> dict:
        poll = await self.repo.get_by_match(match_id)
        if not poll:
            raise NotFoundError(f"No poll found for match {match_id}")

        responses = await self.response_repo.get_by_poll(poll.id)
        return {
            "poll": poll,
            "responses": responses,
            "available": sum(1 for r in responses if r.status == "available"),
            "unavailable": sum(1 for r in responses if r.status == "unavailable"),
            "maybe": sum(1 for r in responses if r.status == "maybe"),
        }

    async def respond(self, match_id: int, user_id: int, status: str) -> PlayerAvailability:
        if status not in ("available", "unavailable", "maybe"):
            from app.core.exceptions import ValidationError
            raise ValidationError("Status must be available, unavailable, or maybe")

        poll = await self.repo.get_by_match(match_id)
        if not poll:
            raise NotFoundError(f"No poll found for match {match_id}")

        existing = await self.response_repo.get_by_poll_and_user(poll.id, user_id)
        if existing:
            existing.status = status
            await self.response_repo.session.flush()
            return existing

        response = PlayerAvailability(poll_id=poll.id, user_id=user_id, status=status)
        return await self.response_repo.create(response)
