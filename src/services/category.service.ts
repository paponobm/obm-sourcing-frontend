import type { Category, CategoryListQuery, CreateCategoryInput, UpdateCategoryInput } from "@/types/category.types";
import { apiClient } from "./api-client";

export const categoryService = {
  async list(query: CategoryListQuery = {}): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories", { params: query }).then((r) => r.data);
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    return apiClient.post<Category>("/categories", input).then((r) => r.data);
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return apiClient.patch<Category>(`/categories/${id}`, input).then((r) => r.data);
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/categories/${id}`).then(() => undefined);
  },

  async activate(id: string): Promise<Category> {
    return apiClient.patch<Category>(`/categories/${id}/activate`).then((r) => r.data);
  },

  async deactivate(id: string): Promise<Category> {
    return apiClient.patch<Category>(`/categories/${id}/deactivate`).then((r) => r.data);
  },
};
