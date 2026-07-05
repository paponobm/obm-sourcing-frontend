import type { Product, PriceComparison, CreateProductInput } from "@/types/product.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export type ProductSortColumn = "name" | "vendorCount" | "lowestPrice";

export const productService = {
  async list(query: ListQuery<ProductSortColumn> = {}): Promise<PaginatedResult<Product>> {
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

  async getPriceComparison(productId: string): Promise<PriceComparison | undefined> {
    return apiClient.get<PriceComparison>(`/price-comparison/${productId}`).then((r) => r.data);
  },
};
