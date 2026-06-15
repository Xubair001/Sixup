import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage on every request
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On success: touch last-active so inactivity clock resets
client.interceptors.response.use(
  (res) => {
    if (typeof window !== "undefined") {
      // Lazily import to avoid circular deps at module load time
      import("@/stores/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().touchActive();
      });
    }
    return res;
  },
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          // Persist new tokens to localStorage
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // Also sync into Zustand store so UI stays consistent
          import("@/stores/authStore").then(({ useAuthStore }) => {
            useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
          });

          // Retry the original request with the new token
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return client(error.config);
        } catch {
          // Refresh failed — clear everything and send to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          import("@/stores/authStore").then(({ useAuthStore }) => {
            useAuthStore.getState().logout();
          });
          window.location.href = "/login";
        }
      } else {
        import("@/stores/authStore").then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
