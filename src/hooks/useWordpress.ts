"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wordpressService } from "@/services/wordpress.service";
import { getApiErrorMessage } from "@/lib/api-error";

const WORDPRESS_SYNC_STATUS_KEY = ["wordpress", "sync-status"] as const;
const WORDPRESS_SYNC_LOGS_KEY = ["wordpress", "sync-logs"] as const;

export function useWordpressSyncStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: WORDPRESS_SYNC_STATUS_KEY,
    queryFn: () => wordpressService.getSyncStatus(),
    enabled: options?.enabled ?? true,
  });
}

export function useWordpressSyncLogs(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: WORDPRESS_SYNC_LOGS_KEY,
    queryFn: () => wordpressService.getSyncLogs(),
    enabled: options?.enabled ?? true,
  });
}

export function useWordpressSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => wordpressService.sync(),
    onSuccess: (result) => {
      queryClient.setQueryData(WORDPRESS_SYNC_STATUS_KEY, {
        lastSyncedAt: result.lastSyncedAt,
        lastImported: result.imported,
        lastUpdated: result.updated,
        lastSkipped: result.skipped,
      });
      queryClient.invalidateQueries({ queryKey: ["products", "pending"] });
      queryClient.invalidateQueries({ queryKey: WORDPRESS_SYNC_LOGS_KEY });
      toast.success("সিঙ্ক সম্পন্ন হয়েছে", {
        description: `ইম্পোর্ট: ${result.imported} | আপডেট: ${result.updated} | স্কিপড: ${result.skipped}`,
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "WordPress থেকে সিঙ্ক করা যায়নি")),
  });
}
