"use client";

import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import type { ListQuery } from "@/utils/pagination";

export function useActivities(query: ListQuery = {}) {
  return useQuery({
    queryKey: ["activities", "list", query],
    queryFn: () => activityService.list(query),
    placeholderData: (prev) => prev,
  });
}
