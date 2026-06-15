import { client } from "./client";

export interface MeritEntry {
  id: number;
  user_id: number;
  match_id: number | null;
  type: string;
  reason: string | null;
  points: number;
  awarded_by: number;
  created_at: string;
}

export interface PlayerMeritSummary {
  user_id: number;
  total_merit: number;
  total_demerit: number;
  net: number;
  entries: MeritEntry[];
}

export const meritApi = {
  award: (teamId: number, data: { user_id: number; points: number; type: string; reason?: string; match_id?: number }) =>
    client.post<MeritEntry>(`/merit?team_id=${teamId}`, data).then((r) => r.data),

  getPlayerSummary: (userId: number) =>
    client.get<PlayerMeritSummary>(`/merit/player/${userId}`).then((r) => r.data),

  getMatchMerits: (matchId: number) =>
    client.get<MeritEntry[]>(`/merit/match/${matchId}`).then((r) => r.data),
};
