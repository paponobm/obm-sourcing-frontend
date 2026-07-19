import axios, { type AxiosRequestConfig } from "axios";
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

// Public/unauthenticated auth endpoints — a leftover token from a previous
// session (expired, or belonging to whoever last used this browser) must
// never be sent here. These calls aren't authenticated by a Bearer token in
// the first place (login/verify-otp authenticate via body credentials or an
// OTP code; refresh authenticates via its own refresh-token body field), so
// attaching one is never correct, even though the backend currently ignores
// it on these specific routes (Passport's LocalStrategy reads only the
// request body — see local.strategy.ts). "/auth/request-otp" doesn't exist
// as a route yet, but is listed for forward compatibility.
const PUBLIC_AUTH_ENDPOINTS = ["/auth/login", "/auth/request-otp", "/auth/verify-otp", "/auth/refresh"];

apiClient.interceptors.request.use((config) => {
  const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((path) => config.url?.includes(path));
  const token = authStorage.getToken();
  if (token && !isPublicAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints where a 401 means "these credentials/this code/this refresh
// token are wrong" — never the "access token expired mid-session" case the
// retry-after-refresh flow below exists for. Retrying these through a
// refresh would be meaningless (login/verify-otp aren't even authenticated
// calls) or would recurse into refreshAccessToken itself (refresh/logout).
const AUTH_ENDPOINTS_EXCLUDED_FROM_REFRESH = [...PUBLIC_AUTH_ENDPOINTS, "/auth/logout"];

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
    const config = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
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
