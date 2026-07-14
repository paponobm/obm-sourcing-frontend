import type { Unit, CreateUnitInput, UpdateUnitInput } from "@/types/unit.types";
import { apiClient } from "./api-client";

export const unitService = {
  async list(): Promise<Unit[]> {
    return apiClient.get<Unit[]>("/units").then((r) => r.data);
  },

  async create(input: CreateUnitInput): Promise<Unit> {
    return apiClient.post<Unit>("/units", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateUnitInput): Promise<Unit> {
    return apiClient.patch<Unit>(`/units/${id}`, input).then((r) => r.data);
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/units/${id}`).then(() => undefined);
  },
};
