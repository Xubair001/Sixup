# Sixup — Indoor Cricket Platform

A full-stack indoor cricket management platform for teams who play regularly. Handle everything from team rosters and match scheduling to live ball-by-ball scoring, player stats, leaderboards, and merit/demerit points — all in one responsive app that works equally well on a phone mid-game and a desktop in the dressing room.

---

## Features

### Core (Implemented)

| Area | What it does |
|---|---|
| **Auth & Identity** | JWT-based registration/login with refresh tokens. Every player has a `#PublicID` and `@username`. No admin-created dummy accounts. |
| **Player Profiles** | Display name, avatar, jersey number, bio, batting/bowling style, privacy level, ELO-style rating (300–1000), "looking for team" flag |
| **Teams** | Create teams, invite players by `@username` or `#PublicID`, manage roles per team |
| **RBAC** | Team roles: `owner → captain → vice_captain → scorer → player`. System roles: `superadmin`, `player` |
| **Team Invitations** | Captain invites — player can accept, decline, or let it expire. Never force-added. Expires in 7 days. |
| **Match Management** | Create matches, set scorer, track status (`scheduled / live / completed`), public/private visibility |
| **Live Scoring** | Ball-by-ball via WebSocket. Physical runs, net-zone bonuses, wides, no-balls, wickets all applied in real time |
| **Innings & Pairs** | 4 batting pairs × 4 overs each. Pair-level and ball-level records |
| **Skins** | Pair head-to-head points tracked automatically |
| **Stats** | Per-player batting/bowling aggregates. Privacy-gated: only teammates or players who shared a match can view |
| **Merit/Demerit Points** | Captains award points with a reason. Full history per player |
| **Availability Polls** | Create a poll per match, players respond available / unavailable / maybe |
| **Notifications** | In-app notifications for invites, polls, achievements, match events |
| **Leaderboards** | Team and cross-team leaderboards |
| **QR Code** | Each player profile has a QR code for quick scanning during team setup |
| **Real-time WebSocket** | Live match scoring pushed to all connected clients via Redis Pub/Sub |

### Scoring Rules (Indoor Cricket)

- **8 players** per team batting in **4 pairs**, each pair faces exactly **4 overs**
- **Physical runs**: batsmen running between creases
- **Net zone bonuses**:
  - Side net front court → +2
  - Side net back court → +3
  - Back net along ground → +4
  - Back net on the full → +6
- **Wicket**: −5 from team total; dismissed batsman keeps batting
- **No ball**: +2, delivery not counted in over
- **Wide**: +1, delivery not counted in over
- **Net score** = physical runs + bonus runs − (wickets × 5)

### Roadmap

| Phase | Feature |
|---|---|
| **Phase 2** | Achievement badge system (Century, Hat Trick, Man of the Match, and 7 more) |
| **Phase 2** | Shareable player stat cards (PNG trading-card format) |
| **Phase 2** | Season management (group matches into seasons, season leaderboards) |
| **Phase 3** | Tournament mode — round-robin and knockout brackets |
| **Phase 3** | Public spectator mode via short match code |
| **Phase 4** | Head-to-head records between players |
| **Phase 4** | CSV export for all stats |
| **Phase 4** | Smart availability reminders |
| **Phase 4** | Player discovery directory (opt-in, looking-for-team flag) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (async) |
| **ORM** | SQLAlchemy 2.0 (async, typed `Mapped[]` syntax) |
| **Migrations** | Alembic |
| **Database** | PostgreSQL 16 |
| **Cache / Pub-Sub** | Redis 7 |
| **Auth** | JWT — `python-jose` + `passlib[bcrypt]` |
| **Logging** | Loguru (unified — intercepts uvicorn + stdlib) |
| **Frontend** | Next.js 14 (App Router) |
| **Styling** | TailwindCSS |
| **State** | Zustand |
| **Data fetching** | SWR + Axios (typed) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Real-time** | FastAPI WebSockets + Redis Pub/Sub |
| **Dev infra** | Docker Compose (Postgres + Redis) |

---

## Project Structure

```
sixup/
├── backend/
│   ├── app/
│   │   ├── main.py                    # App factory, middleware, routers
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── database.py                # Async engine + session factory
│   │   ├── core/
│   │   │   ├── logging.py             # Unified Loguru + InterceptHandler
│   │   │   ├── exceptions.py          # Domain exception hierarchy
│   │   │   ├── exception_handlers.py  # Global FastAPI handlers
│   │   │   ├── security.py            # JWT helpers
│   │   │   ├── avatar.py              # Avatar generation
│   │   │   └── cricket_rules.py       # ScoringRules dataclass (single source of truth)
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── repositories/              # Data access layer (DB queries only)
│   │   ├── services/                  # Business logic layer
│   │   ├── routers/                   # Thin route handlers
│   │   ├── dependencies/              # FastAPI Depends factories
│   │   └── websockets/
│   │       └── manager.py             # WebSocket connection manager (singleton)
│   ├── alembic/                       # Migration history
│   ├── static/                        # Avatars, team logos
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── app/                       # Next.js App Router pages
│       ├── components/
│       │   ├── ui/                    # Shared primitives: Button, Card, Badge, Modal…
│       │   ├── scoring/               # Match-day scorer components
│       │   ├── stats/                 # Charts, leaderboards
│       │   ├── teams/
│       │   └── availability/
│       ├── hooks/                     # All data-fetching and state logic
│       ├── stores/                    # Zustand stores
│       ├── lib/
│       │   ├── api/                   # Typed API client modules
│       │   └── utils.ts
│       └── types/                     # Shared TypeScript types
│
├── docs/
│   ├── identity-and-privacy.md        # RBAC matrix, invitation flow, privacy rules, DB schema
│   └── extended-features.md           # Full feature roadmap with interaction map
│
├── docker-compose.yml
├── setup.sh                           # One-time setup (deps + migrations)
└── start.sh                           # Start all services
```

---

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Clone

```bash
git clone git@github.com:Xubair001/Sixup.git
cd Sixup
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, POSTGRES, JWT_SECRET

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Defaults point to localhost:8001 — no changes needed for local dev
```

Generate a strong JWT secret:

```bash
openssl rand -hex 32
```

### 3. Run setup (first time only)

```bash
chmod +x setup.sh && ./setup.sh
```

This will:
- Start Postgres and Redis via Docker Compose
- Create a Python virtual environment and install dependencies
- Run Alembic migrations
- Install frontend npm dependencies

### 4. Start

```bash
chmod +x start.sh && ./start.sh
```

| Service | URL |
|---|---|
| API | http://localhost:8001 |
| API docs (Swagger) | http://localhost:8001/docs |
| Frontend | http://localhost:3000 |

---

## Environment Variables

### `backend/.env`

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | asyncpg URL for the app | — |
| `POSTGRES` | plain psycopg2 URL for Alembic | — |
| `APP_PORT` | API server port | `8001` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing tokens — **change this** | — |
| `JWT_ALGORITHM` | Signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Access token lifetime | `60` |
| `JWT_REFRESH_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `LOG_LEVEL` | Loguru log level | `INFO` |
| `DEBUG` | Enable debug mode | `false` |
| `STATIC_DIR` | Static file directory | `static` |
| `MAX_AVATAR_SIZE_MB` | Avatar upload size limit | `5` |
| `APP_NAME` | Application name | `Indoor Cricket Platform` |

### `frontend/.env.local`

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8001` |
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL | `ws://localhost:8001` |

---

## API Overview

All endpoints are prefixed with `/api/v1`. Full interactive docs at `/docs`.

| Router | Prefix | Key endpoints |
|---|---|---|
| **Auth** | `/auth` | `POST /register`, `POST /login`, `POST /refresh` |
| **Players** | `/players` | `GET /me`, `PUT /me`, `GET /search`, `GET /{id}/stats`, `GET /{id}/qr` |
| **Teams** | `/teams` | `CRUD /`, `GET /{id}/members`, `GET /{id}/leaderboard` |
| **Invitations** | `/invitations` | `POST /`, `POST /{id}/accept`, `POST /{id}/decline` |
| **Matches** | `/matches` | `CRUD /`, `POST /{id}/start`, `POST /{id}/ball`, `GET /{id}/scorecard` |
| **Availability** | `/availability` | `POST /polls`, `POST /polls/{id}/respond` |
| **Merit** | `/merit` | `POST /`, `GET /player/{id}` |
| **Notifications** | `/notifications` | `GET /`, `POST /{id}/read`, `POST /read-all` |
| **WebSocket** | `/ws` | `WS /match/{id}` — live scoring stream |

---

## Architecture Notes

### Layer rules

```
Router  →  validates HTTP, calls service, returns response
Service →  owns ALL business logic, calls repository, raises domain exceptions
Repo    →  owns ALL DB queries, returns ORM models, never raises business exceptions
```

### Privacy

`PrivacyService.assert_can_view_stats(viewer_id, target_id, shared_team_ids)` is the single gatekeeper for all stats access. Call it before returning any player stats — never inline the check.

### Scoring constants

All scoring values (wicket penalty, no-ball penalty, net zone bonuses, overs per pair) live in `backend/app/core/cricket_rules.py` as a frozen `ScoringRules` dataclass. Never scatter magic numbers through the codebase.

### Real-time

The WebSocket manager is a singleton injected via FastAPI `Depends`. Scoring events are published to a Redis channel so multiple API workers all broadcast to their connected clients.

---

## Development

```bash
# Backend (from repo root)
source backend/.venv/bin/activate
uvicorn app.main:app --reload --port 8001 --app-dir backend

# Frontend
cd frontend && npm run dev

# New migration
cd backend && alembic revision --autogenerate -m "description"
cd backend && alembic upgrade head
```

Code style is enforced before every commit:

```bash
# Python
black backend/app && isort backend/app && ruff check backend/app

# TypeScript
cd frontend && npm run lint && npm run type-check
```

---

## Docs

- [Identity, RBAC & Privacy model](docs/identity-and-privacy.md)
- [Full feature roadmap](docs/extended-features.md)
