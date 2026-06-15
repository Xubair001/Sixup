export interface CurrentUser {
  id: number;
  public_id: string;
  username: string;
  email: string;
  system_role: string;
  is_verified: boolean;
  display_name?: string;
}

export interface PlayerProfile {
  user_id: number;
  display_name: string;
  avatar_url: string | null;
  jersey_number: number | null;
  bio: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  privacy_level: string;
  rating: number;
  is_looking_for_team: boolean;
  location: string | null;
}

export interface PublicProfile {
  public_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Team {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  user_id: number;
  role: string;
  status: string;
  jersey_number: number | null;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

export interface Invitation {
  id: number;
  team_id: number;
  team_name: string;
  inviter_username: string;
  invitee_username: string;
  invitee_display_name: string;
  status: string;
  message: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type TeamRole = "owner" | "captain" | "vice_captain" | "scorer" | "player";
export type MemberStatus = "playing" | "bench" | "available";

export interface Match {
  id: number;
  team_home_id: number;
  team_away_id: number;
  date: string | null;
  venue: string | null;
  status: "scheduled" | "live" | "completed";
  short_code: string | null;
  visibility: string;
  scorer_user_id: number | null;
  overs_per_innings: number;
}

export interface Ball {
  id: number;
  innings_id: number;
  over_number: number;
  ball_number: number;
  batsman_user_id: number;
  bowler_user_id: number;
  physical_runs: number;
  net_zone: string;
  bonus_runs: number;
  is_wide: boolean;
  is_no_ball: boolean;
  is_wicket: boolean;
  dismissed_user_id: number | null;
  total_runs: number;
}

export interface BattingStats {
  user_id: number;
  runs: number;
  balls: number;
}

export interface BowlingStats {
  user_id: number;
  wickets: number;
  balls: number;
  runs_conceded: number;
}

export interface InningsStats {
  innings_id: number;
  batting_team_id: number;
  total_runs: number;
  total_wickets: number;
  batting: BattingStats[];
  bowling: BowlingStats[];
  current_over: number;
  current_ball: number;
}

export interface BestPlayer {
  user_id: number;
  runs?: number;
  wickets?: number;
  balls?: number;
}

export interface MatchStats {
  match_id: number;
  innings: InningsStats[];
  best_batsman: BestPlayer | null;
  best_bowler: BestPlayer | null;
}

export interface LeaderboardEntry {
  user_id: number;
  runs?: number;
  wickets?: number;
}

export interface Leaderboard {
  top_batters: LeaderboardEntry[];
  top_bowlers: LeaderboardEntry[];
}

export interface PlayerStats {
  batting: {
    user_id: number;
    balls_faced: number;
    physical_runs: number;
    bonus_runs: number;
    total_runs: number;
    dismissals: number;
  };
  bowling: {
    user_id: number;
    overs_bowled: string;
    runs_conceded: number;
    wickets: number;
    economy: number | null;
  };
}
