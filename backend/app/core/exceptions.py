class AppException(Exception):
    status_code: int = 500
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


# ── 4xx client errors ────────────────────────────────────────────────────────

class NotFoundError(AppException):
    status_code = 404
    detail = "Resource not found"


class ValidationError(AppException):
    status_code = 422
    detail = "Validation failed"


class AuthenticationError(AppException):
    status_code = 401
    detail = "Authentication required"


class AuthorizationError(AppException):
    status_code = 403
    detail = "Insufficient permissions"


class ConflictError(AppException):
    status_code = 409
    detail = "Resource already exists"


# ── 5xx server errors ─────────────────────────────────────────────────────────

class DatabaseError(AppException):
    status_code = 500
    detail = "Database operation failed"


class CacheError(AppException):
    status_code = 500
    detail = "Cache operation failed"


# ── Domain-specific ───────────────────────────────────────────────────────────

class MatchNotLiveError(AppException):
    status_code = 409
    detail = "Match is not in live state"


class InvalidScoringError(AppException):
    status_code = 422
    detail = "Invalid scoring action"


class PairBattingCompleteError(AppException):
    status_code = 409
    detail = "This batting pair has completed their overs"


class InvitationExpiredError(AppException):
    status_code = 410
    detail = "This invitation has expired"


class TeamLimitReachedError(AppException):
    status_code = 409
    detail = "Player has reached the maximum number of teams"


class InviteCooldownError(AppException):
    status_code = 429
    detail = "Cannot re-invite a player within the cooldown period"
