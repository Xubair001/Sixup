"use client";

import useSWR from "swr";
import { notificationsApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/authStore";

export function useNotifications() {
  const { accessToken } = useAuthStore();
  return useSWR(
    accessToken ? "/notifications" : null,
    () => notificationsApi.getAll(),
    { refreshInterval: 30000 }
  );
}

export function useUnreadCount() {
  const { accessToken } = useAuthStore();
  return useSWR(
    accessToken ? "/notifications/unread-count" : null,
    () => notificationsApi.getUnreadCount(),
    { refreshInterval: 30000 }
  );
}
