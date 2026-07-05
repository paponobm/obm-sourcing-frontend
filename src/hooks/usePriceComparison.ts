"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";

export function usePriceComparison(productId: string) {
  return useQuery({
    queryKey: ["price-comparison", productId],
    queryFn: () => productService.getPriceComparison(productId),
    enabled: Boolean(productId),
  });
}
