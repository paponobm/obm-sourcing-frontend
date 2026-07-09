import type { AuthTokens, LoginInput, LoginResult, VerifyOtpInput } from "@/types/auth.types";
import type { User } from "@/types/user.types";
import { apiClient } from "./api-client";

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    return apiClient.post<LoginResult>("/auth/login", input).then((r) => r.data);
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>("/auth/verify-otp", input).then((r) => r.data);
  },

  /**
   * `token` is accepted explicitly (rather than left to the request
   * interceptor to read from storage) because the caller clears storage
   * immediately for a fast logout, before this request would otherwise
   * have picked up the token.
   */
  async logout(token?: string): Promise<void> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    return apiClient.post("/auth/logout", null, config).then(() => undefined);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me").then((r) => r.data);
  },
};
