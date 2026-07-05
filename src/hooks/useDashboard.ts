"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRecentPriceUpdates() {
  return useQuery({
    queryKey: ["dashboard", "recent-price-updates"],
    queryFn: () => dashboardService.getRecentPriceUpdates(),
  });
}
