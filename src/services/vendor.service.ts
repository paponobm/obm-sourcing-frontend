import type { Vendor, VendorWithProducts, CreateVendorInput, UpdateVendorInput } from "@/types/vendor.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export type VendorSortColumn = "shopName" | "productCount" | "status";

export const vendorService = {
  async list(query: ListQuery<VendorSortColumn> = {}): Promise<PaginatedResult<Vendor>> {
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

  async setProductPrice(vendorId: string, productId: string, price: number, rating: number): Promise<void> {
    return apiClient
      .post(`/vendors/${vendorId}/products`, { productId, price, rating })
      .then(() => undefined);
  },
};
