import io
import os

from loguru import logger

from app.config import settings
from app.core.exceptions import NotFoundError
from app.models.player_profile import PlayerProfile
from app.repositories.player_profile_repo import PlayerProfileRepository
from app.repositories.user_repo import UserRepository
from app.schemas.player import PlayerProfileUpdate, PlayerSearchResult
from app.services.base import BaseService


class PlayerService(BaseService[PlayerProfileRepository]):
    def __init__(
        self,
        profile_repo: PlayerProfileRepository,
        user_repo: UserRepository,
    ) -> None:
        super().__init__(profile_repo)
        self.user_repo = user_repo

    async def get_profile(self, user_id: int) -> PlayerProfile:
        profile = await self.repo.get_by_user_id(user_id)
        if not profile:
            raise NotFoundError(f"Profile for user {user_id} not found")
        return profile

    async def update_profile(self, user_id: int, data: PlayerProfileUpdate) -> PlayerProfile:
        profile = await self.get_profile(user_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(profile, field, value)
        await self.repo.session.flush()
        logger.info("Profile updated for user {uid}", uid=user_id)
        return profile

    async def update_avatar(self, user_id: int, image_bytes: bytes, content_type: str) -> str:
        from PIL import Image

        profile = await self.get_profile(user_id)
        user = await self.user_repo.get_by_id(user_id)

        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")
        img = img.resize((400, 400), Image.LANCZOS)

        avatars_dir = os.path.join(settings.STATIC_DIR, "avatars")
        os.makedirs(avatars_dir, exist_ok=True)
        filename = f"{user.public_id}.webp"  # type: ignore[union-attr]
        filepath = os.path.join(avatars_dir, filename)

        img.save(filepath, "WEBP", quality=85)
        avatar_url = f"/static/avatars/{filename}"
        profile.avatar_url = avatar_url
        await self.repo.session.flush()
        logger.info("Avatar updated for user {uid}", uid=user_id)
        return avatar_url

    async def search(self, query: str, limit: int = 10) -> list[PlayerSearchResult]:
        users = await self.user_repo.search_by_username_or_public_id(query, limit=limit)
        return [
            PlayerSearchResult(
                public_id=u.public_id,
                username=u.username,
                display_name=u.profile.display_name if u.profile else u.username,
                avatar_url=u.profile.avatar_url if u.profile else None,
            )
            for u in users
        ]
