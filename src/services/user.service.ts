import type { User } from "@/types/user.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export const userService = {
  async list(query: ListQuery = {}): Promise<PaginatedResult<User>> {
    return apiClient.get<PaginatedResult<User>>("/users", { params: query }).then((r) => r.data);
  },
};
