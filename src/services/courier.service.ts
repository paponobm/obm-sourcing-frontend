import type { Courier, CreateCourierInput, UpdateCourierInput } from "@/types/courier.types";
import { apiClient } from "./api-client";

export const courierService = {
  async list(): Promise<Courier[]> {
    return apiClient.get<Courier[]>("/couriers").then((r) => r.data);
  },

  async create(input: CreateCourierInput): Promise<Courier> {
    return apiClient.post<Courier>("/couriers", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateCourierInput): Promise<Courier> {
    return apiClient.patch<Courier>(`/couriers/${id}`, input).then((r) => r.data);
  },

  async activate(id: string): Promise<Courier> {
    return apiClient.patch<Courier>(`/couriers/${id}/activate`).then((r) => r.data);
  },

  async deactivate(id: string): Promise<Courier> {
    return apiClient.patch<Courier>(`/couriers/${id}/deactivate`).then((r) => r.data);
  },
};
