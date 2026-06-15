"use client";

import useSWR from "swr";
import { invitationsApi } from "@/lib/api/invitations";

export function useMyInvitations() {
  return useSWR("/players/me/invitations", () => invitationsApi.getMyInvitations());
}

export function useTeamInvitations(teamId: number | null) {
  return useSWR(
    teamId ? `/teams/${teamId}/invitations` : null,
    () => invitationsApi.getTeamInvitations(teamId!)
  );
}
