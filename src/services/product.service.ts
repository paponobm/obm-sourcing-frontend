import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  PendingProduct,
  ApproveProductInput,
  RejectProductInput,
  ProductActivityLog,
} from "@/types/product.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export type ProductSortColumn = "name" | "vendorCount" | "lowestPrice";

export type ProductListQuery = ListQuery<ProductSortColumn> & {
  categoryId?: string;
  statusFilter?: "active" | "inactive" | "all" | "pending" | "rejected";
  /** A Manager's "my products" view — scopes to their own submissions. */
  ownOnly?: boolean;
};

export const productService = {
  async list(query: ProductListQuery = {}): Promise<PaginatedResult<Product>> {
    return apiClient.get<PaginatedResult<Product>>("/products", { params: query }).then((r) => r.data);
  },

  async listPending(): Promise<PendingProduct[]> {
    return apiClient.get<PendingProduct[]>("/products/pending").then((r) => r.data);
  },

  async create(input: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>("/products", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateProductInput): Promise<Product | undefined> {
    return apiClient.patch<Product>(`/products/${id}`, input).then((r) => r.data);
  },

  async approve(id: string, input: ApproveProductInput): Promise<void> {
    return apiClient.patch(`/products/${id}/approve`, input).then(() => undefined);
  },

  async reject(id: string, input: RejectProductInput): Promise<void> {
    return apiClient.patch(`/products/${id}/reject`, input).then(() => undefined);
  },

  async activate(id: string): Promise<void> {
    return apiClient.patch(`/products/${id}/activate`).then(() => undefined);
  },

  async deactivate(id: string): Promise<void> {
    return apiClient.patch(`/products/${id}/deactivate`).then(() => undefined);
  },

  async getActivityLogs(id: string): Promise<ProductActivityLog[]> {
    return apiClient.get<ProductActivityLog[]>(`/products/${id}/activity-logs`).then((r) => r.data);
  },
};
