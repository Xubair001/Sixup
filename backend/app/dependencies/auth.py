from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationError
from app.core.security import decode_token
from app.database import get_session
from app.repositories.user_repo import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    if not credentials:
        raise AuthenticationError("Bearer token required")
    return decode_token(credentials.credentials)


async def get_current_user_id(
    payload: Annotated[dict, Depends(get_current_user_payload)],
) -> int:
    return int(payload["sub"])


async def require_superadmin(
    payload: Annotated[dict, Depends(get_current_user_payload)],
) -> dict:
    if payload.get("system_role") != "superadmin":
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Superadmin access required")
    return payload
