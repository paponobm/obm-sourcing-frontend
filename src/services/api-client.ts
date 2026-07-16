import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { authStorage } from "@/lib/auth-storage";
import type { RefreshTokenResult } from "@/types/auth.types";

/**
 * Central axios instance. Every service imports this instead of calling
 * axios directly, so swapping environments/auth behavior is a single edit.
 */
export const apiClient = axios.create({
    // baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
    // baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://obm-sourcing-backend.onrender.com/api",
     baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://obm-sourcing-backend.onrender.com/api",

  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints where a 401 means "these credentials/this code/this refresh
// token are wrong" — never the "access token expired mid-session" case the
// retry-after-refresh flow below exists for. Retrying these through a
// refresh would be meaningless (login/verify-otp aren't even authenticated
// calls) or would recurse into refreshAccessToken itself (refresh/logout).
const AUTH_ENDPOINTS_EXCLUDED_FROM_REFRESH = ["/auth/login", "/auth/verify-otp", "/auth/refresh", "/auth/logout"];

// The production backend (Render free tier) spins down after ~15 minutes
// idle and takes up to ~40s to wake back up — the very first request(s)
// after a spin-down get a closed/refused connection (no `error.response` at
// all, since the server never actually responded) rather than a normal HTTP
// error. Transparently retrying those specifically (never a real 4xx/5xx,
// which always has a `response`) turns that into a brief loading toast
// instead of a hard failure the user has to manually retry 4-5 times.
const COLD_START_RETRY_LIMIT = 8;
const COLD_START_RETRY_DELAY_MS = 5_000;
const COLD_START_TOAST_ID = "cold-start-retry";

function isConnectionError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response && error.code !== "ERR_CANCELED";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** De-duped across concurrent 401s: the first one to land triggers the
 * refresh call, every other concurrent 401 just awaits the same promise
 * instead of each firing its own /auth/refresh request. */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Deliberately a bare axios call, not `apiClient` — going through
    // apiClient would re-run these same interceptors on the refresh call.
    const { data } = await axios.post<RefreshTokenResult>(`${apiClient.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    });
    authStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as
      | (AxiosRequestConfig & { _retried?: boolean; _coldStartRetries?: number })
      | undefined;

    if (config && isConnectionError(error)) {
      const attempt = (config._coldStartRetries ?? 0) + 1;
      config._coldStartRetries = attempt;

      if (attempt <= COLD_START_RETRY_LIMIT) {
        toast.loading("সার্ভার প্রস্তুত হচ্ছে, একটু অপেক্ষা করুন...", { id: COLD_START_TOAST_ID });
        await wait(COLD_START_RETRY_DELAY_MS);
        try {
          const response = await apiClient.request(config);
          toast.dismiss(COLD_START_TOAST_ID);
          return response;
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }
      toast.dismiss(COLD_START_TOAST_ID);
    }

    const status = error.response?.status;
    const isExcluded = AUTH_ENDPOINTS_EXCLUDED_FROM_REFRESH.some((path) => config?.url?.includes(path));

    // Only attempt the silent-refresh-and-retry dance once per request, and
    // never for the auth endpoints above — everything else just falls
    // through to the original hard-logout behavior.
    if (status !== 401 || !config || config._retried || isExcluded) {
      if (status === 401) authStorage.clear();
      return Promise.reject(error);
    }

    config._retried = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      authStorage.clear();
      return Promise.reject(error);
    }

    config.headers = { ...config.headers, Authorization: `Bearer ${newAccessToken}` };
    return apiClient.request(config);
  },
);
