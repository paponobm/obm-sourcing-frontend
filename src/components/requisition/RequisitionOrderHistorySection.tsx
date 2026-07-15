"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderHistoryFilters } from "@/components/vendor/OrderHistoryFilters";
import {
  RequisitionOrderHistoryTable,
  type RequisitionOrderHistorySortColumn,
} from "./RequisitionOrderHistoryTable";
import { useRequisitionOrderHistory } from "@/hooks/useRequisitions";
import { useDebounce } from "@/hooks/use-debounce";
import type { OrderStatus } from "@/types/invoice.types";

const PAGE_SIZE = 10;

/** One row per (requisition, invoice) pairing that fulfilled at least one
 * item — searchable by requisition ID or product name, filterable by status
 * and date range, sortable — same client-side pipeline as the vendor's own
 * OrderHistorySection (there's realistically not enough volume here to need
 * server-side filtering, matching that existing convention). */
export function RequisitionOrderHistorySection() {
  const { data: rows, isLoading } = useRequisitionOrderHistory();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortColumn, setSortColumn] = useState<RequisitionOrderHistorySortColumn>("orderedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows ?? [];
    const term = debouncedSearch.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (r) =>
          r.requisitionCode.toLowerCase().includes(term) ||
          r.items.some((i) => i.productName.toLowerCase().includes(term)),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (dateFrom) {
      result = result.filter((r) => r.orderedAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.orderedAt <= `${dateTo}T23:59:59.999Z`);
    }
    return result;
  }, [rows, debouncedSearch, statusFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortColumn === "requisitionCode") return a.requisitionCode.localeCompare(b.requisitionCode) * dir;
      return (new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()) * dir;
    });
  }, [filtered, sortColumn, sortDirection]);

  const total = sorted.length;
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSortChange = (column: string) => {
    const col = column as RequisitionOrderHistorySortColumn;
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  };

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if ((rows?.length ?? 0) === 0) {
    return (
      <Card>
        <EmptyState title="কোনো অর্ডার হিস্টরি নেই" description="রিকুইজিশন থেকে অর্ডার তৈরি হলে সেটি এখানে দেখাবে।" />
      </Card>
    );
  }

  return (
    <>
      <OrderHistoryFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="রিকুইজিশন আইডি বা প্রোডাক্টের নাম দিয়ে সার্চ করুন..."
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
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
      />

      <RequisitionOrderHistoryTable
        rows={paged}
        total={total}
        page={page}
        onPageChange={setPage}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </>
  );
}
