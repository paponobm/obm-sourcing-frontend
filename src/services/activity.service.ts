import type { ActivityLog } from "@/types/activity.types";
import type { PaginatedResult } from "@/types/common.types";
import type { ListQuery } from "@/utils/pagination";
import { apiClient } from "./api-client";

export const activityService = {
  async list(query: ListQuery = {}): Promise<PaginatedResult<ActivityLog>> {
    return apiClient.get<PaginatedResult<ActivityLog>>("/activities", { params: query }).then((r) => r.data);
  },
};
