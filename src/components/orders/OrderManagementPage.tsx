"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { OrderSummaryCards } from "./OrderSummaryCards";
import { OrderQuickFilters } from "./OrderQuickFilters";
import { OrderSearchBar } from "./OrderSearchBar";
import { OrderAdvancedFilters } from "./OrderAdvancedFilters";
import { OrdersTable } from "./OrdersTable";
import { useOrders, useOrderSummary } from "@/hooks/useOrders";
import { useDebounce } from "@/hooks/use-debounce";
import type { OrderSortMode } from "@/types/order.types";

const PAGE_SIZE = 10;

export function OrderManagementPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  // Defaults to Pending per spec ("show only Pending orders by default").
  const [statusFilter, setStatusFilter] = useState("IN_TRANSIT");
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
    setStatusFilter(value);
    setPage(1);
  };

  const pendingCount = summary?.pendingOrders ?? 0;

  return (
    <>
      <Topbar title={statusFilter === "IN_TRANSIT" ? `পেন্ডিং অর্ডার (${pendingCount})` : "অর্ডার ম্যানেজমেন্ট"} />

      <OrderSummaryCards summary={summary} />

      <OrderQuickFilters active={statusFilter} onChange={handleStatusChange} />

      <div className="mb-3.5 sm:mb-4">
        <OrderSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
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
      />
    </>
  );
}
