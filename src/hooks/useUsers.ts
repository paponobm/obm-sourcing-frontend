"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type { ListQuery } from "@/utils/pagination";

export function useUsers(query: ListQuery = {}) {
  return useQuery({
    queryKey: ["users", "list", query],
    queryFn: () => userService.list(query),
    placeholderData: (prev) => prev,
  });
}
