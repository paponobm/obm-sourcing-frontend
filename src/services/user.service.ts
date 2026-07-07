import type { User, CreateUserInput, UpdateUserInput } from "@/types/user.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export const userService = {
  async list(query: ListQuery = {}): Promise<PaginatedResult<User>> {
    return apiClient.get<PaginatedResult<User>>("/users", { params: query }).then((r) => r.data);
  },

  async create(input: CreateUserInput): Promise<User> {
    return apiClient.post<User>("/users", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, input).then((r) => r.data);
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`).then(() => undefined);
  },
};
