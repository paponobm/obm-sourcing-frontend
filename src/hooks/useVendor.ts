"use client";

import { useQuery } from "@tanstack/react-query";
import { vendorService } from "@/services/vendor.service";

export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendors", id],
    queryFn: () => vendorService.getById(id),
    enabled: Boolean(id),
  });
}
