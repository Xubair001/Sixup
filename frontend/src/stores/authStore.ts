"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrentUser } from "@/types";

const INACTIVITY_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

interface AuthState {
  user: CurrentUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  lastActive: number | null; // unix ms
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: CurrentUser) => void;
  touchActive: () => void;
  logout: () => void;
  checkInactivity: () => boolean; // returns true if session is still valid
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      lastActive: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setTokens: (access, refresh) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
        }
        set({ accessToken: access, refreshToken: refresh, lastActive: Date.now() });
      },

      setUser: (user) => set({ user }),

      touchActive: () => set({ lastActive: Date.now() }),

      checkInactivity: () => {
        const { lastActive, accessToken } = get();
        if (!accessToken) return false;
        if (!lastActive) return true; // no timestamp yet — assume valid
        return Date.now() - lastActive < INACTIVITY_MS;
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        set({ user: null, accessToken: null, refreshToken: null, lastActive: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        lastActive: state.lastActive,
      }),
      onRehydrateStorage: () => (state) => {
        // Called once localStorage is read back into the store
        if (!state) return;

        // Enforce inactivity: if last active > 2 days ago, wipe session
        if (
          state.accessToken &&
          state.lastActive &&
          Date.now() - state.lastActive >= INACTIVITY_MS
        ) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.lastActive = null;
        }

        state.setHasHydrated(true);
      },
    }
  )
);
