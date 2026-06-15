import { client } from "./client";
import type { Invitation } from "@/types";

export const invitationsApi = {
  send: (teamId: number, data: { username_or_public_id: string; message?: string }) =>
    client.post<Invitation>(`/teams/${teamId}/invitations`, data).then((r) => r.data),

  getTeamInvitations: (teamId: number) =>
    client.get<Invitation[]>(`/teams/${teamId}/invitations`).then((r) => r.data),

  getMyInvitations: () =>
    client.get<Invitation[]>("/players/me/invitations").then((r) => r.data),

  accept: (id: number) =>
    client.post<Invitation>(`/invitations/${id}/accept`).then((r) => r.data),

  decline: (id: number) =>
    client.post<Invitation>(`/invitations/${id}/decline`).then((r) => r.data),
};
