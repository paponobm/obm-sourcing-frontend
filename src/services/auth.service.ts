import type { LoginInput, LoginResponse } from "@/types/auth.types";
import type { User } from "@/types/user.types";
import { apiClient } from "./api-client";

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", input).then((r) => r.data);
  },

  async logout(): Promise<void> {
    return apiClient.post("/auth/logout").then(() => undefined);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me").then((r) => r.data);
  },
};
