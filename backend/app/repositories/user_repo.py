from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.session.execute(select(User).where(User.username == username.lower()))
        return result.scalar_one_or_none()

    async def get_by_public_id(self, public_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.public_id == public_id.upper()))
        return result.scalar_one_or_none()

    async def get_with_profile(self, user_id: int) -> User | None:
        result = await self.session.execute(
            select(User).options(selectinload(User.profile)).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def search_by_username_or_public_id(self, query: str, limit: int = 10) -> list[User]:
        q = query.lower().lstrip("@#")
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(
                User.is_active.is_(True),
                (User.username.ilike(f"{q}%") | (User.public_id == q.upper())),
            )
            .limit(limit)
        )
        return list(result.scalars().all())

    async def username_exists(self, username: str) -> bool:
        result = await self.session.execute(
            select(User.id).where(User.username == username.lower())
        )
        return result.scalar_one_or_none() is not None

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(User.id).where(User.email == email.lower())
        )
        return result.scalar_one_or_none() is not None
