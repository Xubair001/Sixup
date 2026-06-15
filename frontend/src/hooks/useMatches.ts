import useSWR from "swr";
import { matchesApi } from "@/lib/api/matches";
import type { Match, MatchStats, Leaderboard, PlayerStats } from "@/types";

export function useTeamMatches(teamId: number | undefined) {
  return useSWR<Match[]>(
    teamId ? `/matches/team/${teamId}` : null,
    () => matchesApi.getTeamMatches(teamId!)
  );
}

export function useMatch(id: number | undefined) {
  return useSWR<Match>(
    id ? `/matches/${id}` : null,
    () => matchesApi.getMatch(id!)
  );
}

export function useMatchStats(id: number | undefined) {
  return useSWR<MatchStats>(
    id ? `/matches/${id}/stats` : null,
    () => matchesApi.getMatchStats(id!)
  );
}

export function useLeaderboard() {
  return useSWR<Leaderboard>("/matches/stats/leaderboard", matchesApi.getLeaderboard);
}

export function usePlayerStats(userId: number | undefined) {
  return useSWR<PlayerStats>(
    userId ? `/matches/stats/player/${userId}` : null,
    () => matchesApi.getPlayerStats(userId!)
  );
}
