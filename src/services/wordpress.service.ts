import type { WordpressSyncResult, WordpressSyncStatus, WordpressSyncLogEntry } from "@/types/wordpress.types";
import { apiClient } from "./api-client";

export const wordpressService = {
  async getSyncStatus(): Promise<WordpressSyncStatus> {
    return apiClient.get<WordpressSyncStatus>("/wordpress/sync-status").then((r) => r.data);
  },

  async getSyncLogs(): Promise<WordpressSyncLogEntry[]> {
    return apiClient.get<WordpressSyncLogEntry[]>("/wordpress/sync-logs").then((r) => r.data);
  },

  // A full WooCommerce catalog sync can take well past the client's default
  // 15s timeout — this is a manual, infrequent admin action, so a generous
  // per-call override is safer than raising the timeout globally.
  async sync(): Promise<WordpressSyncResult> {
    return apiClient
      .post<WordpressSyncResult>("/wordpress/sync", undefined, { timeout: 120_000 })
      .then((r) => r.data);
  },
};
