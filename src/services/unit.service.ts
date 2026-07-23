import type { Unit, UnitListQuery, CreateUnitInput, UpdateUnitInput } from "@/types/unit.types";
import { apiClient } from "./api-client";

export const unitService = {
  async list(query: UnitListQuery = {}): Promise<Unit[]> {
    return apiClient.get<Unit[]>("/units", { params: query }).then((r) => r.data);
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

  async activate(id: string): Promise<Unit> {
    return apiClient.patch<Unit>(`/units/${id}/activate`).then((r) => r.data);
  },

  async deactivate(id: string): Promise<Unit> {
    return apiClient.patch<Unit>(`/units/${id}/deactivate`).then((r) => r.data);
  },
};
