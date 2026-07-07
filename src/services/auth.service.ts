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

  async logout(): Promise<void> {
    return apiClient.post("/auth/logout").then(() => undefined);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me").then((r) => r.data);
  },
};
