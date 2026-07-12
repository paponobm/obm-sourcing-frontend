"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import type { OrderListQuery } from "@/types/order.types";

const ORDERS_KEY = ["orders"] as const;

export function useOrders(query: OrderListQuery) {
  return useQuery({
    queryKey: [...ORDERS_KEY, "list", query],
    queryFn: () => orderService.list(query),
    placeholderData: (prev) => prev,
  });
}

export function useOrderSummary() {
  return useQuery({
    queryKey: [...ORDERS_KEY, "summary"],
    queryFn: () => orderService.getSummary(),
  });
}
