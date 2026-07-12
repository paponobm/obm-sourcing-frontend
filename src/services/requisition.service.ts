import type {
  PendingRequisition,
  CompletedRequisition,
  CreateRequisitionInput,
  ConvertRequisitionInput,
} from "@/types/requisition.types";
import { apiClient } from "./api-client";

export const requisitionService = {
  async listPending(): Promise<PendingRequisition[]> {
    return apiClient.get<PendingRequisition[]>("/requisitions/pending").then((r) => r.data);
  },

  async listCompleted(): Promise<CompletedRequisition[]> {
    return apiClient.get<CompletedRequisition[]>("/requisitions/completed").then((r) => r.data);
  },

  async create(input: CreateRequisitionInput): Promise<PendingRequisition> {
    return apiClient.post<PendingRequisition>("/requisitions", input).then((r) => r.data);
  },

  async convert(id: string, input: ConvertRequisitionInput): Promise<void> {
    return apiClient.patch(`/requisitions/${id}/convert`, input).then(() => undefined);
  },

  async cancel(id: string): Promise<void> {
    return apiClient.patch(`/requisitions/${id}`, { status: "CANCELLED" }).then(() => undefined);
  },
};
