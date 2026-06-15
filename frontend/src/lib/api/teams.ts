import { client } from "./client";
import type { Team, TeamMember } from "@/types";

export const teamsApi = {
  create: (data: { name: string; color?: string }) =>
    client.post<Team>("/teams", data).then((r) => r.data),

  getMyTeams: () => client.get<Team[]>("/teams/mine").then((r) => r.data),

  getTeam: (id: number) => client.get<Team>(`/teams/${id}`).then((r) => r.data),

  updateTeam: (id: number, data: { name?: string; color?: string }) =>
    client.put<Team>(`/teams/${id}`, data).then((r) => r.data),

  getMembers: (id: number) =>
    client.get<TeamMember[]>(`/teams/${id}/members`).then((r) => r.data),

  updateMemberRole: (teamId: number, userId: number, role: string) =>
    client.patch(`/teams/${teamId}/members/${userId}/role`, { role }).then((r) => r.data),

  removeMember: (teamId: number, userId: number) =>
    client.delete(`/teams/${teamId}/members/${userId}`).then((r) => r.data),

  leaveTeam: (teamId: number) =>
    client.post(`/teams/${teamId}/leave`).then((r) => r.data),
};
