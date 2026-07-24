import type { Backup } from "@/types/backup.types";
import { apiClient } from "./api-client";

export const backupService = {
  async list(): Promise<Backup[]> {
    return apiClient.get<Backup[]>("/backups").then((r) => r.data);
  },

  async create(): Promise<Backup> {
    return apiClient.post<Backup>("/backups").then((r) => r.data);
  },

  async deleteLocalCopy(id: string): Promise<void> {
    return apiClient.delete(`/backups/${id}/local`).then(() => undefined);
  },

  async deleteDriveCopy(id: string): Promise<void> {
    return apiClient.delete(`/backups/${id}/drive`).then(() => undefined);
  },

  /** Downloads via a Bearer-token'd fetch (a plain `<a href>` can't carry
   * the auth header) — pulls the file as a blob, then triggers the
   * browser's normal save-file behavior. */
  async download(id: string, fileName: string): Promise<void> {
    const response = await apiClient.get(`/backups/${id}/download`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
