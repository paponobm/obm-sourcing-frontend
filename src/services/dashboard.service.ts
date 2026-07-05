import type { DashboardStats, RecentPriceUpdate } from "@/types/dashboard.types";
import { apiClient } from "./api-client";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>("/dashboard").then((r) => r.data);
  },

  async getRecentPriceUpdates(): Promise<RecentPriceUpdate[]> {
    return apiClient.get<RecentPriceUpdate[]>("/dashboard/recent-price-updates").then((r) => r.data);
  },
};
