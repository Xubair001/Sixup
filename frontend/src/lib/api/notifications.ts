import { client } from "./client";
import type { Notification } from "@/types";

export const notificationsApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    client.get<Notification[]>("/notifications", { params }).then((r) => r.data),

  getUnreadCount: () =>
    client.get<{ count: number }>("/notifications/unread-count").then((r) => r.data),

  markAllRead: () => client.post("/notifications/read-all").then((r) => r.data),

  markOneRead: (id: number) =>
    client.post(`/notifications/${id}/read`).then((r) => r.data),
};
