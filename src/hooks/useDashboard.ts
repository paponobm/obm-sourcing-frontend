"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { productService } from "@/services/product.service";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import type {
  ProductStats,
  ProductStatsFilters,
  VendorStats,
  VendorStatsFilters,
  OrderStatsFilters,
} from "@/types/dashboard.types";
import type { OrderSummary } from "@/types/order.types";

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

// These three hooks power the Dashboard's Product/Vendor/Order analytics
// sections. None of them hit a dedicated stats endpoint — the backend has
// none for these three resources — they fetch the existing list endpoints
// with a large page size and aggregate client-side, the same "fine at this
// app's expected scale" in-memory aggregation convention the backend itself
// already uses (see ProductsService.list, InvoicesService.listAll).
const STATS_FETCH_ALL_PAGE_SIZE = 10_000;
const MONTHLY_ACTIVE_WINDOW_DAYS = 30;

function isWithinDateRange(iso: string, dateFrom?: string, dateTo?: string): boolean {
  const time = new Date(iso).getTime();
  if (dateFrom && time < new Date(dateFrom).getTime()) return false;
  if (dateTo) {
    // Inclusive of the whole end day — matches the backend's own
    // buildDateRangeFilter semantics.
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    if (time > end.getTime()) return false;
  }
  return true;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Fetches the category+date-filtered set of products (both Active+Inactive)
 * and derives Total/Active/Inactive counts in memory. `status`, per the same
 * convention as the backend's (unused) ProductStatsQueryDto, narrows only the
 * Total tile — Active/Inactive always reflect the full date+category set. */
export function useProductStats(filters: ProductStatsFilters = {}) {
  return useQuery({
    queryKey: ["dashboard", "product-stats", filters],
    queryFn: async (): Promise<ProductStats> => {
      const page = await productService.list({
        statusFilter: "all",
        categoryId: filters.categoryId,
        pageSize: STATS_FETCH_ALL_PAGE_SIZE,
      });
      const inRange = page.data.filter((p) => isWithinDateRange(p.createdAt, filters.dateFrom, filters.dateTo));
      const activeProducts = inRange.filter((p) => p.status === "ACTIVE").length;
      const inactiveProducts = inRange.filter((p) => p.status === "INACTIVE").length;
      const totalProducts = filters.status
        ? inRange.filter((p) => p.status === filters.status).length
        : activeProducts + inactiveProducts;
      return { totalProducts, activeProducts, inactiveProducts };
    },
  });
}

/** Same client-side pattern as useProductStats. "Monthly Active Vendors" is a
 * fixed rolling 30-day metric (vendors with >=1 order placed in that window,
 * derived from the existing /invoices data) — it intentionally ignores this
 * section's own date/status filters, since it names a specific absolute
 * window rather than an arbitrary filterable range. */
export function useVendorStats(filters: VendorStatsFilters = {}) {
  return useQuery({
    queryKey: ["dashboard", "vendor-stats", filters],
    queryFn: async (): Promise<VendorStats> => {
      const [page, monthlyActiveSuppliers] = await Promise.all([
        vendorService.list({ statusFilter: "all", pageSize: STATS_FETCH_ALL_PAGE_SIZE }),
        getMonthlyActiveVendorCount(),
      ]);
      const inRange = page.data.filter((v) => isWithinDateRange(v.createdAt, filters.dateFrom, filters.dateTo));
      const activeVendors = inRange.filter((v) => v.status === "ACTIVE").length;
      const inactiveVendors = inRange.filter((v) => v.status === "INACTIVE").length;
      const totalVendors = filters.status
        ? inRange.filter((v) => v.status === filters.status).length
        : activeVendors + inactiveVendors;
      return { totalVendors, activeVendors, inactiveVendors, monthlyActiveSuppliers };
    },
  });
}

async function getMonthlyActiveVendorCount(): Promise<number> {
  const orders = await orderService.list({
    dateFrom: isoDaysAgo(MONTHLY_ACTIVE_WINDOW_DAYS),
    pageSize: STATS_FETCH_ALL_PAGE_SIZE,
  });
  return new Set(orders.data.map((o) => o.vendorId)).size;
}

/** Same client-side pattern, over the existing /invoices list endpoint
 * (which already supports these exact filters) instead of the unfiltered
 * /invoices/summary the real Order Management page uses via useOrderSummary. */
export function useOrderStats(filters: OrderStatsFilters = {}) {
  return useQuery({
    queryKey: ["dashboard", "order-stats", filters],
    queryFn: async (): Promise<OrderSummary> => {
      const page = await orderService.list({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        vendorId: filters.vendorId,
        status: filters.status,
        pageSize: STATS_FETCH_ALL_PAGE_SIZE,
      });
      const countFor = (status: string) => page.data.filter((o) => o.status === status).length;
      const totalProcurementCost = page.data
        .filter((o) => o.status === "CLOSED")
        .reduce((sum, o) => sum + (o.procurementCost ?? 0), 0);

      return {
        totalOrders: page.data.length,
        // Confirmed is still pre-warehouse — grouped with Pending here the
        // same way the Pending Invoice view treats both as one list.
        pendingOrders: countFor("IN_TRANSIT") + countFor("CONFIRMED"),
        receivedOrders: countFor("RECEIVED") + countFor("VERIFIED"),
        closedOrders: countFor("CLOSED"),
        discrepancyOrders: countFor("DISCREPANCY"),
        totalProcurementCost,
      };
    },
  });
}
