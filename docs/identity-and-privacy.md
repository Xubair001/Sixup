# User Identity & Privacy Model

## Core Principle

Every human is a `User`. There is no such thing as an "admin-created player" —
a player **is** a user who self-registered. Admins can invite them to teams,
but they can never impersonate or create a dummy account on someone's behalf.

---

## Identity Layers

```
User (auth account)
  └── PlayerProfile (public identity — 1:1 with User)
        └── TeamMembership (many — a player can be on multiple teams)
```

### User (auth layer)

| Field | Notes |
|---|---|
| `id` | Internal UUID. Never exposed in URLs. |
| `public_id` | Short 8-char alphanumeric. Shown in UI for sharing: `#A3K9P2QR` |
| `username` | Unique, case-insensitive handle. `@ali_hassan`. Used for search + invites. |
| `email` | Login credential. Private — never shown to other users. |
| `password_hash` | bcrypt via passlib. |
| `is_verified` | Email-verified flag. |
| `is_active` | Soft-disable without deletion. |
| `created_at` | |

### PlayerProfile (public identity)

| Field | Notes |
|---|---|
| `user_id` | FK to users.id (unique) |
| `display_name` | Full name as shown on scorecards. Editable. |
| `avatar_url` | Uploaded to local storage (or S3 later). |
| `jersey_number` | Optional preference. Can differ per team. |
| `bio` | Short optional text. Max 160 chars. |
| `phone` | Optional. Private — only visible to team admin. |
| `batting_style` | right/left |
| `bowling_style` | right-arm-fast / left-arm-medium / etc. |
| `privacy_level` | `public` / `team_only` (default: team_only) |

---

## RBAC — Role Definitions

### System-level roles (stored on `users.system_role`)

| Role | Who has it | What they can do |
|---|---|---|
| `superadmin` | Platform owner | Everything. Impersonate users, delete data. |
| `player` | All registered users | Self-profile, own stats, own team actions. Default role. |

### Team-level roles (stored on `team_members.role`)

| Role | Assigned by | What they can do |
|---|---|---|
| `owner` | Auto-assigned to team creator | Delete team, transfer ownership, all below |
| `captain` | Owner | Create matches, assign scorer, manage lineup |
| `vice_captain` | Owner or captain | Manage availability, limited match edits |
| `scorer` | Captain | Access live scoring UI for assigned match |
| `player` | Anyone invited + accepted | View team stats, respond to availability |

A user can have different roles in different teams. Being `owner` of Team A does not grant any power in Team B.

---

## Permission Matrix

```
Action                              | Own  | Teammate | Captain | Owner | Superadmin
------------------------------------|------|----------|---------|-------|----------
View own full stats                 |  ✓   |    ✗     |   ✗     |   ✗   |    ✓
View teammate's stats               |  ✓   |    ✓     |   ✓     |   ✓   |    ✓
View opponent stats (same match)    |  ✓   |    ✓     |   ✓     |   ✓   |    ✓
View stranger's stats               |  ✗   |    ✗     |   ✗     |   ✗   |    ✓
View public profile (name+avatar)   |  ✓   |    ✓     |   ✓     |   ✓   |    ✓
Edit own profile                    |  ✓   |    ✗     |   ✗     |   ✗   |    ✓
Create team                         |  ✓   |    ✓     |   ✓     |   ✓   |    ✓
Invite player to team               |  ✗   |    ✗     |   ✓     |   ✓   |    ✓
Remove player from team             |  ✗   |    ✗     |   ✗     |   ✓   |    ✓
Leave team                          |  ✓   |    ✓     |   ✓     |   ✗   |    ✓
Create/edit match                   |  ✗   |    ✗     |   ✓     |   ✓   |    ✓
Score a match                       |  ✗   |    ✗     |   ✓*    |   ✓*  |    ✓
Award merit/demerit points          |  ✗   |    ✗     |   ✓     |   ✓   |    ✓
Transfer team ownership             |  ✗   |    ✗     |   ✗     |   ✓   |    ✓
```

`*` Captain can also delegate scoring to a specific player via `match.scorer_user_id`.

---

## Team Invitation Flow

Players are never force-added. Always invited.

```
Captain searches for @username or #publicID
    → Backend returns PublicProfileResponse (name, avatar, handle only)
    → Captain confirms → POST /teams/{id}/invitations {invitee_username}
        → team_invitations row created (status: pending)
        → Notification created for invitee
            → Invitee sees invite on dashboard
            → Accepts → team_members row created, invitation status = accepted
            → Declines → invitation status = declined
            → Ignores for 7 days → invitation expires automatically
```

### Invitation Rules

- A player can only be invited once per team (duplicate invite returns 409)
- A player can be on a maximum of 5 teams (configurable in `ScoringRules`)
- Invites expire after 7 days
- Captain cannot re-invite a player who declined within 30 days
- Player leaving a team deletes their team_members row but retains their match history (stats are match-level, not membership-level)

---

## Profile Search

Used when adding players to teams or searching for opponents.

**Search endpoint**: `GET /players/search?q={term}&limit=10`

Search matches against:
1. `username` (exact prefix match, highest priority)
2. `public_id` (exact match)
3. `display_name` (fuzzy, lower priority)

Response is always `PublicProfileResponse` — never leaks email, phone, or stats.

```python
class PublicProfileResponse(BaseModel):
    public_id: str          # #A3K9P2QR
    username: str           # @ali_hassan
    display_name: str       # Ali Hassan
    avatar_url: str | None
    # NO stats, NO email, NO phone, NO merit points
```

---

## Privacy Rules in Code

The permission check must live in a single service method — never scattered:

```python
# backend/app/services/privacy_service.py

class PrivacyService:
    def can_view_player_stats(self, viewer_id: int, target_id: int, shared_team_ids: list[int]) -> bool:
        if viewer_id == target_id:
            return True
        if not shared_team_ids:
            return False
        # Both must be active members of at least one common team
        return True

    def assert_can_view_stats(self, viewer_id: int, target_id: int, shared_team_ids: list[int]) -> None:
        if not self.can_view_player_stats(viewer_id, target_id, shared_team_ids):
            raise AuthorizationError(f"You do not have access to view this player's stats")
```

Every stats endpoint calls `privacy_service.assert_can_view_stats()` before returning data.

---

## Database Schema — Identity Tables

```sql
users
  id              SERIAL PRIMARY KEY
  public_id       VARCHAR(8) UNIQUE NOT NULL       -- #A3K9P2QR
  username        CITEXT UNIQUE NOT NULL            -- case-insensitive text extension
  email           VARCHAR(255) UNIQUE NOT NULL
  password_hash   VARCHAR(255) NOT NULL
  system_role     VARCHAR(20) DEFAULT 'player'
  is_verified     BOOLEAN DEFAULT FALSE
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMPTZ DEFAULT NOW()

player_profiles
  id              SERIAL PRIMARY KEY
  user_id         INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
  display_name    VARCHAR(100) NOT NULL
  avatar_url      VARCHAR(500)
  jersey_number   SMALLINT
  bio             VARCHAR(160)
  phone           VARCHAR(20)
  batting_style   VARCHAR(20)
  bowling_style   VARCHAR(50)
  privacy_level   VARCHAR(20) DEFAULT 'team_only'

teams
  id              SERIAL PRIMARY KEY
  name            VARCHAR(100) NOT NULL
  slug            VARCHAR(100) UNIQUE             -- url-safe name
  color           VARCHAR(7)                      -- #hex
  logo_url        VARCHAR(500)
  created_by      INTEGER REFERENCES users(id)
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMPTZ DEFAULT NOW()

team_members
  id              SERIAL PRIMARY KEY
  team_id         INTEGER REFERENCES teams(id) ON DELETE CASCADE
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE
  role            VARCHAR(20) DEFAULT 'player'    -- owner/captain/vice_captain/scorer/player
  jersey_number   SMALLINT                        -- team-specific override
  joined_at       TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(team_id, user_id)

team_invitations
  id              SERIAL PRIMARY KEY
  team_id         INTEGER REFERENCES teams(id) ON DELETE CASCADE
  inviter_id      INTEGER REFERENCES users(id)
  invitee_id      INTEGER REFERENCES users(id)
  status          VARCHAR(20) DEFAULT 'pending'   -- pending/accepted/declined/expired
  message         VARCHAR(200)                    -- optional personal note
  created_at      TIMESTAMPTZ DEFAULT NOW()
  expires_at      TIMESTAMPTZ                     -- NOW() + 7 days
  responded_at    TIMESTAMPTZ
  UNIQUE(team_id, invitee_id)                     -- one active invite per person per team
```

---

## Avatar Upload

```
POST /players/me/avatar  (multipart/form-data)
    → validate: max 5MB, jpg/png/webp only
    → resize to 400×400 via Pillow
    → save to backend/static/avatars/{user_public_id}.webp
    → update player_profiles.avatar_url
    → invalidate player cache

GET /static/avatars/{user_public_id}.webp  (served by FastAPI StaticFiles)
```

Never store raw uploaded filenames — always use the user's `public_id` as the filename to prevent path traversal.

---

## JWT Payload

```json
{
  "sub": "42",
  "public_id": "A3K9P2QR",
  "username": "ali_hassan",
  "system_role": "player",
  "exp": 1234567890
}
```

Team roles are **not** in the JWT — they're checked at the service layer against the DB on each request that needs them. This avoids stale role issues when a captain demotes someone.
