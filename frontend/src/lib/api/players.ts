import { client } from "./client";
import type { PlayerProfile, PublicProfile } from "@/types";

export const playersApi = {
  getMyProfile: () => client.get<PlayerProfile>("/players/me").then((r) => r.data),

  updateMyProfile: (data: Partial<PlayerProfile>) =>
    client.put<PlayerProfile>("/players/me", data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<{ avatar_url: string }>("/players/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  search: (q: string) =>
    client.get<PublicProfile[]>("/players/search", { params: { q } }).then((r) => r.data),

  getProfile: (userId: number) =>
    client.get<PlayerProfile>(`/players/${userId}/profile`).then((r) => r.data),
};
