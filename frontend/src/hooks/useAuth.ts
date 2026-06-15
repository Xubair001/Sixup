"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, accessToken, setUser, logout } = useAuthStore();

  const { data, error, isLoading } = useSWR(
    accessToken ? "/auth/me" : null,
    () => authApi.me(),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (error?.response?.status === 401) logout();
  }, [error, logout]);

  return {
    user: user ?? data ?? null,
    isLoading,
    isAuthenticated: !!accessToken,
    logout,
  };
}

export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading };
}
