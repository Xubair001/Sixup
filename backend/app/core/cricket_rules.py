from dataclasses import dataclass, field


@dataclass(frozen=True)
class ScoringRules:
    WICKET_PENALTY: int = 0
    NO_BALL_RUNS: int = 1
    WIDE_RUNS: int = 1
    NET_BONUS: dict[str, int] = field(
        default_factory=lambda: {
            "side_front": 2,
            "side_back": 3,
            "back_ground": 4,
            "back_full": 6,
            "none": 0,
        }
    )
    OVERS_PER_PAIR: int = 4
    PAIRS_PER_INNINGS: int = 4
    PLAYERS_PER_TEAM: int = 8
    MAX_TEAMS_PER_PLAYER: int = 5
    INVITE_EXPIRY_DAYS: int = 7
    INVITE_COOLDOWN_DAYS: int = 30
    MIN_PLAYER_RATING: int = 300
    MAX_PLAYER_RATING: int = 1000
    DEFAULT_PLAYER_RATING: int = 600


RULES = ScoringRules()
