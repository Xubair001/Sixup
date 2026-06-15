"use client";

import useSWR from "swr";
import { teamsApi } from "@/lib/api/teams";

export function useMyTeams() {
  return useSWR("/teams/mine", () => teamsApi.getMyTeams());
}

export function useTeam(id: number | null) {
  return useSWR(id ? `/teams/${id}` : null, () => teamsApi.getTeam(id!));
}

export function useTeamMembers(teamId: number | null) {
  return useSWR(
    teamId ? `/teams/${teamId}/members` : null,
    () => teamsApi.getMembers(teamId!)
  );
}
