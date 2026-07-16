import type { OrderStatus } from "./invoice.types";

export type OrderListItem = {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  orderedAt: string;
  itemCount: number;
  totalAmount: number;
  procurementCost: number | null;
  status: OrderStatus;
  orderedByName: string;
  updatedAt: string;
};

export type OrderSummary = {
  totalOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  closedOrders: number;
  discrepancyOrders: number;
  totalProcurementCost: number;
};

/** One clean dropdown value standing in for the {sortColumn, sortDirection,
 * statusFirst} triple the backend expects — see `translateSortMode`. */
export type OrderSortMode =
  | "newest"
  | "oldest"
  | "vendorAsc"
  | "vendorDesc"
  | "costHigh"
  | "costLow"
  | "pendingFirst"
  | "receivedFirst"
  | "closedFirst"
  | "discrepancyFirst";

export type OrderListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
  sortMode?: OrderSortMode;
};
