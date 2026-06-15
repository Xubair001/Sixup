import { client } from "./client";
import type { CurrentUser, TokenResponse } from "@/types";

export const authApi = {
  register: (data: { username: string; email: string; password: string; display_name: string }) =>
    client.post<TokenResponse>("/auth/register", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<TokenResponse>("/auth/login", data).then((r) => r.data),

  me: () => client.get<CurrentUser>("/auth/me").then((r) => r.data),
};
