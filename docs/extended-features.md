# Extended Feature Set

Features beyond core scoring — organised by value vs complexity.

---

## Tier 1 — Build with core (Phase 1–2)

These are so tightly coupled to the identity model they should be built from day one.

### Player QR Code

Every player profile has a QR code encoding their `#publicID`. At the ground, instead of
typing a username, captain opens the "Add Player" screen → taps Scan QR → camera reads
QR → player found instantly.

```
GET /players/me/qr-code
    → returns SVG QR code encoding "indoor-cricket://player/#A3K9P2QR"
    → frontend renders it as a shareable PNG card
```

The QR also works as a deep link on mobile: tapping it opens the app to that player's
public profile.

### Notification System

Drives invites, availability polls, match results, and achievements.

```sql
notifications
  id          SERIAL PRIMARY KEY
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE
  type        VARCHAR(50)      -- team_invite / availability_poll / match_result / achievement / merit_point
  title       VARCHAR(100)
  body        VARCHAR(300)
  payload     JSONB            -- {team_id: 3, invitation_id: 12} etc.
  is_read     BOOLEAN DEFAULT FALSE
  created_at  TIMESTAMPTZ DEFAULT NOW()
```

```
GET  /notifications           → paginated, unread first
POST /notifications/read-all  → mark all read
POST /notifications/{id}/read → mark one read
```

Frontend: red dot badge on bell icon, notification drawer. PWA push notifications
via Web Push API (add later — no native app needed).

### Player Profile Editor

Players own their own data. They can update anytime without asking admin.

```
GET  /players/me              → own full profile
PUT  /players/me              → update display_name, bio, jersey_number, batting_style, bowling_style
POST /players/me/avatar       → upload new avatar (multipart)
PUT  /players/me/privacy      → toggle privacy_level between public / team_only
POST /players/me/change-password
```

---

## Tier 2 — Phase 3 (Stats & Social)

### Achievement / Badge System

Auto-awarded server-side when match is completed. No human grants these.

| Badge | Trigger |
|---|---|
| **First Blood** | First ever run scored |
| **Half Century** | 50+ runs in a single match |
| **Century** | 100+ runs in a single match |
| **Hat Trick** | 3 wickets in consecutive balls |
| **Five-fer** | 5+ wickets in an innings |
| **Man of the Match** | Highest `performance_score` in match |
| **Iron Gloves** | 5+ catches in career |
| **Consistent** | 20+ matches played |
| **Skins King** | Most skins points in a season |
| **Clean Sheet** | Team wins without conceding a wicket |

```sql
achievements
  id              SERIAL PRIMARY KEY
  user_id         INTEGER REFERENCES users(id)
  badge_key       VARCHAR(50)                   -- 'half_century', 'hat_trick' etc.
  match_id        INTEGER REFERENCES matches(id)
  awarded_at      TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(user_id, badge_key, match_id)          -- same badge can be earned multiple times (different matches)
```

Badges displayed on player profile. Logic lives in `AchievementService.evaluate_post_match(match_id)` — called once when a match is marked complete.

### Player Rating (ELO-style)

A single number (300–1000) representing overall performance level. Updated after every completed match.

```
rating_delta = base_weight * (
    (runs / avg_team_runs) * 0.4 +
    (wickets * 10) * 0.3 +
    (catches * 5) * 0.1 +
    (merit_points) * 0.1 +
    (match_result_bonus: win=+10, loss=-5) * 0.1
)
```

Stored on `player_profiles.rating`. Used for:
- "Top Rated Players" leaderboard
- Team-building suggestions ("your weakest position is bowling — rated players available to invite")
- Matchmaking fairness indicator when captains are setting up a match

### Shareable Stat Card

A server-rendered PNG image of a player's season stats — like a cricket trading card.
Shareable to WhatsApp, Instagram, etc. No auth required to view.

```
GET /players/{public_id}/stat-card?season={id}
    → returns image/png (200×300px)
    → rendered server-side with Pillow
    → cached in Redis for 1 hour
    → shows: avatar, name, matches, runs, avg, wickets, rating badge, top achievement
```

Frontend: "Share My Card" button on player profile → opens native share sheet on mobile.

### Season Management

Group matches into seasons to separate historical stats.

```sql
seasons
  id          SERIAL PRIMARY KEY
  name        VARCHAR(100)       -- "Summer 2026", "Winter League"
  start_date  DATE
  end_date    DATE
  is_active   BOOLEAN DEFAULT FALSE   -- only one season active at a time
  created_by  INTEGER REFERENCES users(id)
```

Stats endpoints always accept `?season_id=` to filter. If omitted, return career stats.
Leaderboards default to the active season.

---

## Tier 3 — Phase 4 (Tournament)

### Tournament / Competition Mode

```sql
tournaments
  id              SERIAL PRIMARY KEY
  name            VARCHAR(100)
  format          VARCHAR(20)       -- 'round_robin' / 'knockout' / 'group_knockout'
  season_id       INTEGER REFERENCES seasons(id)
  max_teams       SMALLINT
  status          VARCHAR(20)       -- 'registration' / 'active' / 'completed'
  created_by      INTEGER REFERENCES users(id)

tournament_teams
  tournament_id   INTEGER REFERENCES tournaments(id)
  team_id         INTEGER REFERENCES teams(id)
  group           VARCHAR(5)        -- 'A', 'B' for group stage
  UNIQUE(tournament_id, team_id)
```

Matches created within a tournament automatically feed into standings.
Frontend: bracket visualiser (simple SVG tree for knockout, points table for round-robin).

### Public Match Spectator Mode

Matches can be set `visibility = 'public'`. Generates a shareable URL:

```
https://app.example.com/watch/MATCH-SHORTCODE
```

No login required. Shows live scorecard, updated via WebSocket. Perfect for
sharing with family/friends at the ground who aren't in the app.

```sql
-- Add to matches table:
visibility      VARCHAR(20) DEFAULT 'private'   -- private / team_only / public
short_code      VARCHAR(8) UNIQUE               -- random 8-char for public URL
```

---

## Tier 4 — Phase 5 (Polish)

### Head-to-Head Records

When viewing a match between Team A vs Team B, show their historical record:

```
GET /teams/{id}/head-to-head/{opponent_id}
    → { played: 12, team_wins: 7, opponent_wins: 5, last_match: {...} }
```

Also available for players:

```
GET /players/{id}/head-to-head/{opponent_id}
    → { batting_avg_vs: 38.2, wickets_taken_from: 4 }
```

Computed from match history. Cached in Redis, invalidated on new match.

### Export Stats

```
GET /players/me/export?format=csv&season_id=1
GET /teams/{id}/export?format=csv&season_id=1
```

CSV download of all match stats. Useful for team admins doing offline analysis.

### Availability Smart Reminders

If a player hasn't responded to an availability poll 24 hours before the match:

1. Push notification: "⚠️ Ali, you haven't confirmed availability for Saturday's match vs Thunder XI"
2. If still no response 2 hours before, captain is notified: "3 players have not confirmed"

Logic in a background task (FastAPI `BackgroundTasks` or APScheduler).

### "Find a Player" Discovery

Opt-in public directory. Players who set `privacy_level = 'public'` appear here.
Captains searching for players to fill a team can filter by:
- Location (add `location` to profile — city/suburb only, not GPS)
- Batting style, bowling style
- Rating range
- Availability (player marks themselves as "looking for team")

```sql
-- Add to player_profiles:
is_looking_for_team  BOOLEAN DEFAULT FALSE
location             VARCHAR(100)
```

---

## Feature Interaction Map

```
User registers
    → PlayerProfile created (auto, same transaction)
    → Notification: "Welcome, set up your profile"

Captain creates team
    → Becomes team owner
    → Can search @username or scan QR
    → Sends invitation
        → Invitee notified
        → Accepts → joins team, notification to captain
        → Declines → captain can try someone else

Match created
    → Availability poll auto-created
    → Active team members notified
    → Players respond
    → Captain sees availability summary, builds squad

Match played
    → Scorer records balls (WebSocket live)
    → Match completed
    → AchievementService.evaluate_post_match() runs
    → Ratings updated
    → Notifications: "Match result: your team won 147–132"
    → Stats invalidated in Redis cache
    → Stat cards re-renderable
```

---

## What NOT to Build

- No direct messaging between players (scope creep, moderation nightmare)
- No public comments or reactions (same reason)
- No GPS tracking during matches
- No video upload (storage cost, out of scope)
- No payment / subscription tiers (keep it free and simple)
