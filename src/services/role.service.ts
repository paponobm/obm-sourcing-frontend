import type { Role } from "@/types/user.types";
import { apiClient } from "./api-client";

export const roleService = {
  async list(): Promise<Role[]> {
    return apiClient.get<Role[]>("/roles").then((r) => r.data);
  },
};
