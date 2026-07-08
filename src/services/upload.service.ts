import { apiClient } from "./api-client";

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{ url: string }>("/uploads/image", formData);
    return data.url;
  },
};
