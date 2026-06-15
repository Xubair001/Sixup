# Indoor Cricket Platform — CLAUDE.md

## Project Overview

A full-stack indoor cricket management platform. Teams, matches, live scoring, player stats, leaderboards, availability polls, merit/demerit points — all in one responsive app that works on mobile and desktop.

**Primary constraint**: The match-day scorer UI runs on a phone mid-game. Every scoring interaction must be reachable in one thumb tap. Never add friction to that path.

### Detailed Design Docs

- [docs/identity-and-privacy.md](docs/identity-and-privacy.md) — User identity model, RBAC permission matrix, team invitation flow, privacy rules, DB schema for users/teams/invitations
- [docs/extended-features.md](docs/extended-features.md) — Full feature roadmap: achievements, ratings, tournaments, QR codes, stat cards, spectator mode, seasons

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Database | PostgreSQL (localhost) |
| Cache | Redis |
| Auth | JWT (python-jose + passlib[bcrypt]) |
| Logging | **Loguru** (unified — intercepts uvicorn + stdlib) |
| Frontend | Next.js 14+ (App Router) |
| Styling | TailwindCSS |
| State | Zustand |
| Charts | Recharts |
| HTTP client | Axios (typed) |
| Real-time | FastAPI WebSockets + Redis Pub/Sub |

---

## Directory Structure

```
indoor-cricket/
├── backend/
│   ├── app/
│   │   ├── main.py                    # App factory, middleware, routers
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── database.py                # Async engine + session factory
│   │   ├── core/
│   │   │   ├── logging.py             # Unified Loguru setup (InterceptHandler)
│   │   │   ├── exceptions.py          # Custom exception hierarchy
│   │   │   ├── exception_handlers.py  # Global FastAPI exception handlers
│   │   │   └── security.py            # JWT helpers
│   │   ├── models/                    # SQLAlchemy ORM models (one per domain)
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── repositories/              # Data access layer (DB queries only)
│   │   │   └── base.py                # BaseRepository[ModelT]
│   │   ├── services/                  # Business logic layer
│   │   │   └── base.py                # BaseService[ModelT, RepoT]
│   │   ├── routers/                   # Route handlers (thin — delegate to services)
│   │   ├── dependencies/              # FastAPI Depends factories
│   │   └── websockets/
│   │       └── manager.py             # WebSocket connection manager
│   ├── alembic/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── ui/                    # Shared primitives (Button, Card, Badge…)
│   │   │   ├── scoring/               # Match-day scorer components
│   │   │   ├── stats/                 # Charts, leaderboards
│   │   │   ├── teams/
│   │   │   └── availability/
│   │   ├── hooks/                     # All data-fetching + state logic
│   │   ├── stores/                    # Zustand stores
│   │   ├── lib/
│   │   │   ├── api/                   # Typed API client modules
│   │   │   │   ├── client.ts          # Base Axios instance
│   │   │   │   ├── matches.ts
│   │   │   │   ├── players.ts
│   │   │   │   └── stats.ts
│   │   │   └── utils.ts
│   │   └── types/                     # Shared TypeScript types
│   └── package.json
│
└── docker-compose.yml                 # Postgres + Redis
```

---

## User Identity Model (summary — full detail in docs/identity-and-privacy.md)

Every human is a `User`. No admin-created dummy player accounts.

- `User` → auth account. Has `public_id` (#A3K9P2QR), `username` (@handle), `email` (private).
- `PlayerProfile` → 1:1 with User. Display name, avatar, bio, batting/bowling style.
- `TeamMember` → a user can belong to multiple teams with different roles per team.
- Players are **invited** to teams (captain searches @username or #publicID or scans QR). Never force-added.
- Stats are visible only to: yourself + active teammates + players who shared a match. Never to strangers.
- JWT contains `sub`, `public_id`, `username`, `system_role`. Team roles are NOT in JWT — checked at service layer.
- `PrivacyService.assert_can_view_stats(viewer_id, target_id, shared_team_ids)` — single method for all stats access checks. Call it before returning any stats.

### Team Roles (team_members.role)

`owner` → `captain` → `vice_captain` → `scorer` → `player`

Captain delegates scoring to a specific user via `match.scorer_user_id`.

---

## Backend Architecture Rules

### Layer Responsibilities — Never Cross These

```
Router  →  validates HTTP request, calls service, returns response
Service →  owns ALL business logic, calls repository, raises domain exceptions
Repo    →  owns ALL DB queries, returns ORM models or None, never raises business exceptions
```

Routers must never query the DB directly.
Services must never build HTTP responses.
Repos must never contain business rules.

### Base Repository (use for every model)

```python
# backend/app/repositories/base.py
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import Base

ModelT = TypeVar("ModelT", bound=Base)

class BaseRepository(Generic[ModelT]):
    def __init__(self, model: Type[ModelT], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: int) -> Optional[ModelT]:
        result = await self.session.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[ModelT]:
        result = await self.session.execute(select(self.model).limit(limit).offset(offset))
        return list(result.scalars().all())

    async def create(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self.session.delete(obj)
        await self.session.flush()
```

Every repository extends this. Only add methods specific to that domain.

### Base Service

```python
# backend/app/services/base.py
from typing import Generic, TypeVar
from app.repositories.base import BaseRepository

RepoT = TypeVar("RepoT", bound=BaseRepository)

class BaseService(Generic[RepoT]):
    def __init__(self, repository: RepoT):
        self.repo = repository
```

---

## Logging — Loguru (Unified)

**One rule**: every log in the entire app goes through Loguru. Uvicorn, SQLAlchemy, and stdlib `logging` are all intercepted.

### Setup (call once at startup)

```python
# backend/app/core/logging.py
import logging
import sys
from loguru import logger
from app.config import settings

class InterceptHandler(logging.Handler):
    """Redirect all stdlib/uvicorn logging into Loguru."""
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

def setup_logging() -> None:
    logger.remove()  # remove default handler

    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
    )
    logger.add(
        "logs/app.log",
        level="INFO",
        rotation="10 MB",
        retention="7 days",
        compression="gz",
        serialize=False,
    )

    # Intercept all stdlib loggers (uvicorn, sqlalchemy, etc.)
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    for name in logging.root.manager.loggerDict:
        logging.getLogger(name).handlers = [InterceptHandler()]
        logging.getLogger(name).propagate = False
```

### How to log in services and routers

```python
from loguru import logger

# In a service
logger.info("Match {match_id} scoring started", match_id=match.id)
logger.warning("Duplicate ball submission detected for over {over}", over=over_num)
logger.error("Failed to persist ball event", exc_info=True)

# Never use print(). Never use logging.getLogger().
```

### Request logging middleware

```python
# backend/app/middleware/logging_middleware.py
import time
from fastapi import Request
from loguru import logger

async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "{method} {path} → {status} ({duration:.1f}ms)",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration=duration_ms,
    )
    return response
```

---

## Exception Handling

### Custom Exception Hierarchy

```python
# backend/app/core/exceptions.py

class AppException(Exception):
    """Base for all application exceptions."""
    status_code: int = 500
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)

# 4xx — client errors
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

# 5xx — server errors
class DatabaseError(AppException):
    status_code = 500
    detail = "Database operation failed"

class CacheError(AppException):
    status_code = 500
    detail = "Cache operation failed"

# Domain-specific
class MatchNotLiveError(AppException):
    status_code = 409
    detail = "Match is not in live state"

class InvalidScoringError(AppException):
    status_code = 422
    detail = "Invalid scoring action"

class PairBattingCompleteError(AppException):
    status_code = 409
    detail = "This batting pair has completed their overs"
```

### Global Exception Handlers (register in main.py)

```python
# backend/app/core/exception_handlers.py
from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger
from app.core.exceptions import AppException

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(
        "AppException on {path}: [{status}] {detail}",
        path=request.url.path,
        status=exc.status_code,
        detail=exc.detail,
    )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on {path}", path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

```python
# backend/app/main.py  — registration
from app.core.exception_handlers import app_exception_handler, unhandled_exception_handler
from app.core.exceptions import AppException

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
```

### Rules for raising exceptions

- Services raise domain exceptions (`NotFoundError`, `MatchNotLiveError`, etc.) — never `HTTPException`.
- Routers never catch exceptions — let the global handler do it.
- Repos catch `SQLAlchemyError` and re-raise as `DatabaseError`.
- Always include context in the detail string: `raise NotFoundError(f"Player {player_id} not found")`.

---

## OOP Rules

1. **Every repository extends `BaseRepository`**. Never write raw queries in a router or service.
2. **Every service extends `BaseService`**. Never instantiate a repository outside of a service.
3. **Use `@classmethod` factory methods** on schemas when transformation logic is needed, not inline lambdas in routers.
4. **Abstract base classes** for interfaces that will have multiple implementations (e.g., `AbstractCacheService` implemented by `RedisCacheService`).
5. **Dataclasses or Pydantic models** for value objects (e.g., `ScoringEvent`, `BallResult`) — never raw dicts.
6. **No static methods that could be instance methods** — if it uses `self`, it's an instance method.
7. **WebSocket manager is a singleton** injected via dependency injection, not a module-level global.

---

## DRY Rules

- **No query duplication**: if two services need the same query, extract it to the shared repository method.
- **No schema duplication**: use inheritance — `PlayerBase → PlayerCreate → PlayerResponse`.
- **No response formatting duplication**: create a `PaginatedResponse[T]` generic schema.
- **No auth check duplication**: use FastAPI `Depends` with reusable dependency functions.
- **No stats calculation duplication**: all aggregation lives in `stats_service.py`, never in routers or other services.
- **No hardcoded scoring constants**: scoring values (net zone bonuses, wicket penalty) live in `config.py` or a `ScoringRules` dataclass.

```python
# One place for scoring rules — never scatter these numbers
@dataclass(frozen=True)
class ScoringRules:
    WICKET_PENALTY: int = 5
    NO_BALL_PENALTY: int = 2
    NET_BONUS: dict[str, int] = field(default_factory=lambda: {
        "side_front": 2,
        "side_back": 3,
        "back_ground": 4,
        "back_full": 6,
        "none": 0,
    })
    OVERS_PER_PAIR: int = 4
    PAIRS_PER_INNINGS: int = 4
```

---

## Frontend Architecture Rules

### Hooks own all logic — components only render

```typescript
// WRONG — logic in component
export function PlayerCard({ id }: { id: number }) {
  const [player, setPlayer] = useState(null)
  useEffect(() => { fetch(`/api/players/${id}`).then(...) }, [id])
  // ...
}

// RIGHT — hook owns fetching, component owns rendering
export function usePlayer(id: number) {
  return useSWR(`/players/${id}`, () => playersApi.getById(id))
}

export function PlayerCard({ id }: { id: number }) {
  const { data: player, isLoading } = usePlayer(id)
  // render only
}
```

### API client is typed and centralised

```typescript
// lib/api/client.ts  — ONE axios instance, ONE interceptor for auth
const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })
client.interceptors.request.use(attachToken)
client.interceptors.response.use(identity, handleAuthExpiry)

// lib/api/matches.ts  — one module per domain
export const matchesApi = {
  getById: (id: number) => client.get<Match>(`/matches/${id}`).then(r => r.data),
  recordBall: (id: number, ball: BallInput) => client.post<Ball>(`/matches/${id}/balls`, ball).then(r => r.data),
}
```

Never call `fetch()` or `axios` directly in a component or hook — always go through `lib/api/`.

### Component composition over prop drilling

Use compound components + context for scorer UI sub-components. Never pass more than 3 props down — if you need more, introduce a context or store slice.

### Shared UI primitives

Any element used in 2+ places goes into `components/ui/`. Examples: `Button`, `Card`, `Badge`, `Spinner`, `Modal`, `SearchInput`. Never re-style a native element inline — extend the primitive.

---

## Database Schema (canonical — see docs/identity-and-privacy.md for full SQL)

### Identity & Teams
```
users              → id, public_id (#8char), username (CITEXT unique), email, password_hash,
                     system_role (player/superadmin), is_verified, is_active, created_at

player_profiles    → id, user_id (unique FK), display_name, avatar_url, jersey_number,
                     bio, phone (private), batting_style, bowling_style,
                     privacy_level (public/team_only), rating (300–1000),
                     is_looking_for_team, location

teams              → id, name, slug (unique), color, logo_url, created_by (FK users), is_active

team_members       → id, team_id, user_id, role (owner/captain/vice_captain/scorer/player),
                     jersey_number, joined_at — UNIQUE(team_id, user_id)

team_invitations   → id, team_id, inviter_id, invitee_id,
                     status (pending/accepted/declined/expired),
                     message, created_at, expires_at, responded_at — UNIQUE(team_id, invitee_id)
```

### Matches & Scoring
```
seasons            → id, name, start_date, end_date, is_active, created_by
tournaments        → id, name, format, season_id, max_teams, status, created_by
matches            → id, team_home_id, team_away_id, tournament_id, season_id,
                     date, venue, status (scheduled/live/completed),
                     scorer_user_id, visibility (private/team_only/public), short_code
innings            → id, match_id, batting_team_id, total_runs, total_wickets
batting_pairs      → id, innings_id, pair_number (1–4), player1_user_id, player2_user_id,
                     runs, wickets, overs_from, overs_to
balls              → id, innings_id, over_number, ball_number, batsman_user_id, bowler_user_id,
                     physical_runs, net_zone (none/side_front/side_back/back_ground/back_full),
                     bonus_runs, is_wide, is_no_ball, is_wicket, dismissed_user_id, total_runs
```

### Social & Gamification
```
merit_points       → id, user_id, match_id, type (merit/demerit), reason, points, awarded_by
availability_polls → id, match_id, deadline, created_by
player_availability → poll_id, user_id, status (available/unavailable/maybe), responded_at
notifications      → id, user_id, type, title, body, payload (JSONB), is_read, created_at
achievements       → id, user_id, badge_key, match_id, awarded_at — UNIQUE(user_id, badge_key, match_id)
```

---

## Indoor Cricket Scoring Rules (reference)

- Teams of 8 bat in **4 pairs**, each pair faces exactly **4 overs**
- **Physical runs**: batsmen running between creases
- **Bonus runs** (net zones):
  - Side net front court: +2
  - Side net back court: +3
  - Back net along ground: +4
  - Back net on the full: +6
- **Wicket**: −5 from team total, dismissed batsman continues batting
- **No ball**: +2 to batting team, ball not counted in over
- **Wide**: +1 to batting team, ball not counted in over
- Net score = physical runs + bonus runs − (wickets × 5)
- **Skins**: separate point for the winning pair head-to-head (pair 1 vs pair 1, etc.)

---

## Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/indoor_cricket
REDIS_URL=redis://localhost:6379
JWT_SECRET=change_me_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
LOG_LEVEL=INFO

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Code Style

- Python: Black formatter, isort, ruff linter — run before every commit
- TypeScript: ESLint + Prettier — run before every commit
- No `print()` anywhere in Python — use `logger`
- No `console.log()` in production frontend code
- All async Python functions must be `async def` — never block the event loop with sync I/O
- Pydantic schemas: `model_config = ConfigDict(from_attributes=True)` on all response schemas
- SQLAlchemy: use `mapped_column` + `Mapped[T]` typed syntax (2.0 style)

---

## Skills Available

- `/add-api-endpoint` — scaffold a new FastAPI endpoint following service/repo/router pattern
- `/add-frontend-feature` — scaffold a new Next.js feature following hooks/component pattern
- `/add-exception` — add a new domain exception and wire up its handler
- `/add-team-invite` — implement or extend the team invitation flow
