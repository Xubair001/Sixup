import { client } from "./client";
import type { Match, MatchStats, Leaderboard, PlayerStats, Ball } from "@/types";

export const matchesApi = {
  getTeamMatches: (teamId: number) =>
    client.get<Match[]>(`/matches/team/${teamId}`).then((r) => r.data),

  getMatch: (id: number) =>
    client.get<Match>(`/matches/${id}`).then((r) => r.data),

  getMatchStats: (id: number) =>
    client.get<MatchStats>(`/matches/${id}/stats`).then((r) => r.data),

  getLeaderboard: () =>
    client.get<Leaderboard>("/matches/stats/leaderboard").then((r) => r.data),

  getPlayerStats: (userId: number) =>
    client.get<PlayerStats>(`/matches/stats/player/${userId}`).then((r) => r.data),

  createMatch: (data: {
    team_home_id: number;
    team_away_id: number;
    date?: string;
    venue?: string;
    visibility?: string;
    overs_per_innings?: number;
  }) => client.post<Match>("/matches", data).then((r) => r.data),

  startMatch: (id: number) =>
    client.post<Match>(`/matches/${id}/start`).then((r) => r.data),

  completeMatch: (id: number) =>
    client.post<Match>(`/matches/${id}/complete`).then((r) => r.data),

  getRecentBalls: (inningsId: number) =>
    client.get<Ball[]>(`/matches/innings/${inningsId}/recent-balls`).then((r) => r.data),

  undoBall: (ballId: number) =>
    client.delete(`/matches/balls/${ballId}`),
};
