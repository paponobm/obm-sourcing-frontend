import type {
  Requisition,
  RequisitionOrderHistoryRow,
  VendorFulfillableItem,
  CreateRequisitionInput,
} from "@/types/requisition.types";
import type { VendorActivityLog } from "@/types/vendor.types";
import { apiClient } from "./api-client";

export const requisitionService = {
  async listPending(): Promise<Requisition[]> {
    return apiClient.get<Requisition[]>("/requisitions/pending").then((r) => r.data);
  },

  async listConfirmed(): Promise<Requisition[]> {
    return apiClient.get<Requisition[]>("/requisitions/confirmed").then((r) => r.data);
  },

  async listCancelled(): Promise<Requisition[]> {
    return apiClient.get<Requisition[]>("/requisitions/cancelled").then((r) => r.data);
  },

  async listOrderHistory(): Promise<RequisitionOrderHistoryRow[]> {
    return apiClient.get<RequisitionOrderHistoryRow[]>("/requisitions/order-history").then((r) => r.data);
  },

  async getById(id: string): Promise<Requisition> {
    return apiClient.get<Requisition>(`/requisitions/${id}`).then((r) => r.data);
  },

  async getVendorItems(id: string, vendorId: string): Promise<VendorFulfillableItem[]> {
    return apiClient.get<VendorFulfillableItem[]>(`/requisitions/${id}/vendor/${vendorId}/items`).then((r) => r.data);
  },

  async getActivityLogs(id: string): Promise<VendorActivityLog[]> {
    return apiClient.get<VendorActivityLog[]>(`/requisitions/${id}/activity-logs`).then((r) => r.data);
  },

  async create(input: CreateRequisitionInput): Promise<Requisition> {
    return apiClient.post<Requisition>("/requisitions", input).then((r) => r.data);
  },

  async update(id: string, input: Partial<CreateRequisitionInput>): Promise<Requisition> {
    return apiClient.patch<Requisition>(`/requisitions/${id}`, input).then((r) => r.data);
  },

  async confirm(id: string): Promise<Requisition> {
    return apiClient.patch<Requisition>(`/requisitions/${id}/confirm`).then((r) => r.data);
  },

  async cancel(id: string, reason: string): Promise<Requisition> {
    return apiClient.patch<Requisition>(`/requisitions/${id}/cancel`, { reason }).then((r) => r.data);
  },
};
