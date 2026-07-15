import type {
  Vendor,
  VendorWithProducts,
  CreateVendorInput,
  UpdateVendorInput,
  VendorActivityLog,
} from "@/types/vendor.types";
import type { VendorStatus } from "@/types/common.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export type VendorSortColumn = "shopName" | "productCount" | "status";

export type VendorListQuery = ListQuery<VendorSortColumn> & {
  statusFilter?: "active" | "inactive" | "all";
};

export const vendorService = {
  async list(query: VendorListQuery = {}): Promise<PaginatedResult<Vendor>> {
    return apiClient.get<PaginatedResult<Vendor>>("/vendors", { params: query }).then((r) => r.data);
  },

  async getById(id: string): Promise<VendorWithProducts | undefined> {
    return apiClient.get<VendorWithProducts>(`/vendors/${id}`).then((r) => r.data);
  },

  async create(input: CreateVendorInput): Promise<Vendor> {
    return apiClient.post<Vendor>("/vendors", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateVendorInput): Promise<Vendor | undefined> {
    return apiClient.patch<Vendor>(`/vendors/${id}`, input).then((r) => r.data);
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/vendors/${id}`).then(() => undefined);
  },

  async activate(id: string): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}/activate`).then((r) => r.data);
  },

  async deactivate(id: string): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}/deactivate`).then((r) => r.data);
  },

  async updateRating(id: string, rating: number): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}/rating`, { rating }).then((r) => r.data);
  },

  async setProductPrice(
    vendorId: string,
    productId: string,
    price: number,
    rating: number,
    status?: VendorStatus,
  ): Promise<void> {
    return apiClient
      .post(`/vendors/${vendorId}/products`, { productId, price, rating, status })
      .then(() => undefined);
  },

  async getActivityLogs(id: string): Promise<VendorActivityLog[]> {
    return apiClient.get<VendorActivityLog[]>(`/vendors/${id}/activity-logs`).then((r) => r.data);
  },
};
