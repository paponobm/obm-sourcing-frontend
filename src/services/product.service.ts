import type { Product, CreateProductInput } from "@/types/product.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export type ProductSortColumn = "name" | "vendorCount" | "lowestPrice";

export type ProductListQuery = ListQuery<ProductSortColumn> & { categoryId?: string };

export const productService = {
  async list(query: ProductListQuery = {}): Promise<PaginatedResult<Product>> {
    return apiClient.get<PaginatedResult<Product>>("/products", { params: query }).then((r) => r.data);
  },

  async create(input: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>("/products", input).then((r) => r.data);
  },

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product | undefined> {
    return apiClient.patch<Product>(`/products/${id}`, input).then((r) => r.data);
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/products/${id}`).then(() => undefined);
  },
};
