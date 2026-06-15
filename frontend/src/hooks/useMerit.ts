import useSWR from "swr";
import { meritApi, type PlayerMeritSummary } from "@/lib/api/merit";

export function usePlayerMerit(userId: number | undefined) {
  return useSWR<PlayerMeritSummary>(
    userId ? `/merit/player/${userId}` : null,
    () => meritApi.getPlayerSummary(userId!)
  );
}
