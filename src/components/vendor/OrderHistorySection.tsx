"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderHistorySummaryCards } from "@/components/vendor/OrderHistorySummaryCards";
import { OrderHistoryFilters } from "@/components/vendor/OrderHistoryFilters";
import { OrderHistoryTable, type OrderHistorySortColumn } from "@/components/vendor/OrderHistoryTable";
import type { NavigateToSection, VendorSectionKey } from "@/components/vendor/VendorSectionTabs";
import { useVendor } from "@/hooks/useVendor";
import { useVendorInvoices } from "@/hooks/useInvoices";
import { useDebounce } from "@/hooks/use-debounce";
import type { InvoiceListItem, OrderStatus } from "@/types/invoice.types";

/** Which vendor-workspace tab "View" opens for a given invoice status. RECEIVED
 * means goods are physically in but not yet quantity-checked, so it routes into
 * the same warehouse check screen as DISCREPANCY (which resolves it). */
const STATUS_SECTION: Record<OrderStatus, VendorSectionKey> = {
  IN_TRANSIT: "invoicePending",
  CONFIRMED: "invoicePending",
  RECEIVED: "warehouseReceive",
  DISCREPANCY: "warehouseReceive",
  VERIFIED: "invoiceClosed",
  CLOSED: "invoiceClosed",
};

const PAGE_SIZE = 10;

/** The vendor's full procurement history: an auto-computed summary dashboard on
 * top of the searchable/filterable/sortable order table. Everything runs
 * client-side over the existing GET /invoices/vendor/:vendorId list (now
 * carrying orderedByName/updatedAt too), which is realistically small per
 * vendor and needs no new query-param support on the backend. */
export function OrderHistorySection({
  vendorId,
  onNavigateSection,
}: {
  vendorId: string;
  onNavigateSection: NavigateToSection;
}) {
  const { data: vendor } = useVendor(vendorId);
  const { data: invoices, isLoading } = useVendorInvoices(vendorId);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortColumn, setSortColumn] = useState<OrderHistorySortColumn>("orderedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = invoices ?? [];
    const term = debouncedSearch.trim().toLowerCase();
    if (term) {
      result = result.filter((inv) => inv.invoiceNumber.toLowerCase().includes(term));
    }
    if (statusFilter !== "all") {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    if (dateFrom) {
      result = result.filter((inv) => inv.orderedAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((inv) => inv.orderedAt <= `${dateTo}T23:59:59.999Z`);
    }
    return result;
  }, [invoices, debouncedSearch, statusFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortColumn === "invoiceNumber") return a.invoiceNumber.localeCompare(b.invoiceNumber) * dir;
      if (sortColumn === "totalAmount") return (a.totalAmount - b.totalAmount) * dir;
      return (new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()) * dir;
    });
  }, [filtered, sortColumn, sortDirection]);

  const total = sorted.length;
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSortChange = (column: string) => {
    const col = column as OrderHistorySortColumn;
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handleView = (inv: InvoiceListItem) => {
    onNavigateSection(STATUS_SECTION[inv.status], inv.id);
  };

  // An Inactive vendor can't be ordered from (InvoicesService.createForVendor
  // rejects it server-side) — disable this button rather than letting it lead
  // to a New Order form that's guaranteed to fail on submit. Matches
  // VendorSectionTabs' own "newOrder" tab, which disables for the same reason.
  const vendorInactive = vendor?.status === "INACTIVE";
  const newOrderButton = (
    <Button
      type="button"
      variant="brass"
      disabled={vendorInactive}
      title={vendorInactive ? "ইনঅ্যাক্টিভ ভেন্ডরের জন্য নতুন অর্ডার তৈরি করা যাবে না" : undefined}
      onClick={() => onNavigateSection("newOrder")}
    >
      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন অর্ডার
    </Button>
  );

  const title = `অর্ডার হিস্ট্রি${vendor ? ` — ${vendor.shopName}` : ""}`;

  if (isLoading) {
    return (
      <div>
        <Topbar title="অর্ডার হিস্ট্রি" actions={newOrderButton} />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if ((invoices?.length ?? 0) === 0) {
    return (
      <>
        <Topbar title={title} actions={newOrderButton} />
        <Card>
          <EmptyState
            title="কোনো পারচেজ অর্ডার পাওয়া যায়নি"
            description="এই ভেন্ডরের জন্য এখনো কোনো পারচেজ অর্ডার তৈরি করা হয়নি।"
            action={
              <Button
                type="button"
                variant="brass"
                className="mt-2"
                disabled={vendorInactive}
                title={vendorInactive ? "ইনঅ্যাক্টিভ ভেন্ডরের জন্য নতুন অর্ডার তৈরি করা যাবে না" : undefined}
                onClick={() => onNavigateSection("newOrder")}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন অর্ডার তৈরি করুন
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Topbar title={title} actions={newOrderButton} />

      <OrderHistorySummaryCards invoices={invoices ?? []} />

      <OrderHistoryFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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

      <OrderHistoryTable
        invoices={paged}
        total={total}
        page={page}
        onPageChange={setPage}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onView={handleView}
      />
    </>
  );
}
