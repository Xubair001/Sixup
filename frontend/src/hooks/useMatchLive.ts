import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import type { MatchStats } from "@/types";

interface BallEvent {
  type: "ball";
  match_id: number;
  innings_id: number;
  batting_team_id: number;
  total_runs: number;
  total_wickets: number;
  ball: {
    over: number;
    ball: number;
    runs: number;
    is_wide: boolean;
    is_no_ball: boolean;
    is_wicket: boolean;
  };
}

/**
 * Connects to the live WebSocket for a match and patches the SWR cache
 * for `/matches/{id}/stats` so the scorecard updates in real-time
 * for all viewers — not just the scorer.
 */
export function useMatchLive(matchId: number | undefined) {
  const { mutate } = useSWRConfig();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000").replace(/\/$/, "");
    const ws = new WebSocket(`${wsUrl}/ws/matches/${matchId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data: BallEvent = JSON.parse(event.data);
        if (data.type !== "ball") return;

        // Optimistically patch the SWR cache for match stats
        mutate(
          `/matches/${matchId}/stats`,
          (current: MatchStats | undefined): MatchStats | undefined => {
            if (!current) return current;
            return {
              ...current,
              innings: current.innings.map((inn) =>
                inn.innings_id === data.innings_id
                  ? { ...inn, total_runs: data.total_runs, total_wickets: data.total_wickets }
                  : inn
              ),
            };
          },
          { revalidate: false }
        );
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => ws.close();

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [matchId, mutate]);
}
