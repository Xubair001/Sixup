from loguru import logger

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_public_id,
    hash_password,
    verify_password,
)
from app.models.player_profile import PlayerProfile
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.base import BaseService


class AuthService(BaseService[UserRepository]):

    def _build_token_payload(self, user: User) -> dict:
        return {
            "sub": str(user.id),
            "public_id": user.public_id,
            "username": user.username,
            "system_role": user.system_role,
        }

    async def register(self, data: RegisterRequest) -> TokenResponse:
        if await self.repo.email_exists(data.email):
            raise ConflictError("An account with this email already exists")
        if await self.repo.username_exists(data.username):
            raise ConflictError(f"Username @{data.username} is already taken")

        public_id = generate_public_id()
        while await self.repo.get_by_public_id(public_id):
            public_id = generate_public_id()

        user = User(
            public_id=public_id,
            username=data.username.lower(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            system_role="player",
        )
        user = await self.repo.create(user)

        from app.core.avatar import generate_user_avatar
        avatar_url = generate_user_avatar(public_id, data.display_name)

        profile = PlayerProfile(user_id=user.id, display_name=data.display_name, avatar_url=avatar_url)
        self.repo.session.add(profile)
        await self.repo.session.flush()

        logger.info("New user registered: @{username} (#{public_id})", username=user.username, public_id=user.public_id)

        payload = self._build_token_payload(user)
        return TokenResponse(
            access_token=create_access_token(payload),
            refresh_token=create_refresh_token(payload),
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.repo.get_by_email(data.email.lower())
        if not user or not verify_password(data.password, user.password_hash):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("Account is disabled")

        logger.info("User logged in: @{username}", username=user.username)
        payload = self._build_token_payload(user)
        return TokenResponse(
            access_token=create_access_token(payload),
            refresh_token=create_refresh_token(payload),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid token type")

        user = await self.repo.get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive")

        new_payload = self._build_token_payload(user)
        return TokenResponse(
            access_token=create_access_token(new_payload),
            refresh_token=create_refresh_token(new_payload),
        )
