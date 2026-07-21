"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { OrderSummaryCards } from "./OrderSummaryCards";
import { OrderQuickFilters } from "./OrderQuickFilters";
import { OrderSearchBar } from "./OrderSearchBar";
import { OrderAdvancedFilters } from "./OrderAdvancedFilters";
import { OrdersTable } from "./OrdersTable";
import { useOrders, useOrderSummary } from "@/hooks/useOrders";
import { useDebounce } from "@/hooks/use-debounce";
import { useHasRole } from "@/hooks/useHasRole";
import { ROUTES } from "@/constants/routes";
import type { OrderSortMode } from "@/types/order.types";

const PAGE_SIZE = 10;

// Manager only ever acts from পথে আছে (CONFIRMED) onward — no পেন্ডিং
// (IN_TRANSIT, since Manager can't create/confirm those) or ডিসক্রেপান্সি tab.
const MANAGER_TABS = [
  { key: "", label: "সব" },
  { key: "CONFIRMED", label: "পথে আছে" },
  { key: "VERIFIED", label: "ভেরিফায়েড" },
  { key: "CLOSED", label: "ক্লোজড" },
] as const;

export function OrderManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManager = useHasRole(["MANAGER"]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  // Same URL-synced-tabs fix as /products, /categories, /requisitions, and
  // the Vendor workspace — OrderQuickFilters is functionally a tab bar (it
  // swaps the entire table's content), so its active value lives in the URL
  // rather than local state: refresh preserves it, and each switch pushes a
  // real history entry instead of just skipping past it on Back. Defaults to
  // Pending per spec ("show only Pending orders by default") — bundling
  // IN_TRANSIT+CONFIRMED, since a Confirmed order still hasn't reached the
  // warehouse, matching OrderQuickFilters' own "পেন্ডিং" tab. "ALL" is the
  // URL's explicit marker for the "সব" tab (value "") — distinct from no
  // `status` param at all, which means "freshly loaded, default to Pending".
  const statusParam = searchParams.get("status");
  const defaultStatus = isManager ? "CONFIRMED" : "IN_TRANSIT,CONFIRMED";
  const statusFilter = statusParam === null ? defaultStatus : statusParam === "ALL" ? "" : statusParam;
  const [vendorId, setVendorId] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortMode, setSortMode] = useState<OrderSortMode>("newest");
  const [page, setPage] = useState(1);

  const { data: summary } = useOrderSummary();
  const { data, isLoading } = useOrders({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter || undefined,
    vendorId: vendorId || undefined,
    createdById: createdById || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortMode,
  });

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value === "" ? "ALL" : value);
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  };

  const pendingCount = summary?.pendingOrders ?? 0;

  return (
    <>
      <Topbar
        title={
          statusFilter === "IN_TRANSIT,CONFIRMED"
            ? `পেন্ডিং অর্ডার (${pendingCount})`
            : isManager && statusFilter === "CONFIRMED"
              ? "পথে আছে অর্ডার"
              : "অর্ডার ম্যানেজমেন্ট"
        }
      />

      {/* <OrderSummaryCards summary={summary} /> */}

      {/* <OrderQuickFilters active={statusFilter} onChange={handleStatusChange} />

      <div className="mb-3.5 sm:mb-4">
        <OrderSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
      </div> */}
      <div className="mb-3.5 sm:mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Side */}
        <OrderQuickFilters
          active={statusFilter}
          onChange={handleStatusChange}
          tabs={isManager ? MANAGER_TABS : undefined}
        />

        {/* Right Side */}
        <div className="w-full md:w-80 lg:w-96">
          <OrderSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      <OrderAdvancedFilters
        status={statusFilter}
        onStatusChange={handleStatusChange}
        vendorId={vendorId}
        onVendorIdChange={(v) => {
          setVendorId(v);
          setPage(1);
        }}
        createdById={createdById}
        onCreatedByIdChange={(v) => {
          setCreatedById(v);
          setPage(1);
        }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
        sortMode={sortMode}
        onSortModeChange={(v) => {
          setSortMode(v);
          setPage(1);
        }}
      />

      <OrdersTable
        orders={data?.data ?? []}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        viewHref={isManager ? (o) => ROUTES.invoiceDetail(o.id) : undefined}
        hideTotalColumn={isManager}
      />
    </>
  );
}
