import type { OrderListItem, OrderListQuery, OrderSortMode, OrderSummary } from "@/types/order.types";
import type { OrderStatus } from "@/types/invoice.types";
import type { PaginatedResult } from "@/types/common.types";
import { apiClient } from "./api-client";

/** Translates the one UI-facing sort dropdown value into the
 * {sortColumn, sortDirection, statusFirst} triple the backend expects. */
function translateSortMode(mode?: OrderSortMode): {
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  statusFirst?: OrderStatus;
} {
  switch (mode) {
    case "oldest":
      return { sortColumn: "orderedAt", sortDirection: "asc" };
    case "vendorAsc":
      return { sortColumn: "vendorName", sortDirection: "asc" };
    case "vendorDesc":
      return { sortColumn: "vendorName", sortDirection: "desc" };
    case "costHigh":
      return { sortColumn: "totalAmount", sortDirection: "desc" };
    case "costLow":
      return { sortColumn: "totalAmount", sortDirection: "asc" };
    case "pendingFirst":
      return { statusFirst: "IN_TRANSIT" };
    case "receivedFirst":
      return { statusFirst: "RECEIVED" };
    case "closedFirst":
      return { statusFirst: "CLOSED" };
    case "discrepancyFirst":
      return { statusFirst: "DISCREPANCY" };
    case "newest":
    default:
      return { sortColumn: "orderedAt", sortDirection: "desc" };
  }
}

export const orderService = {
  async list(query: OrderListQuery): Promise<PaginatedResult<OrderListItem>> {
    const { sortMode, ...rest } = query;
    const params = { ...rest, ...translateSortMode(sortMode) };
    return apiClient.get<PaginatedResult<OrderListItem>>("/invoices", { params }).then((r) => r.data);
  },

  async getSummary(): Promise<OrderSummary> {
    return apiClient.get<OrderSummary>("/invoices/summary").then((r) => r.data);
  },
};
