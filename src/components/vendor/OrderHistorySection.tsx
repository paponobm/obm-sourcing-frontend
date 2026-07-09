"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import type { NavigateToSection, VendorSectionKey } from "@/components/vendor/VendorSectionTabs";
import { useVendor } from "@/hooks/useVendor";
import { useVendorInvoices } from "@/hooks/useInvoices";
import { useDebounce } from "@/hooks/use-debounce";
import { ORDER_STATUS_LABEL_BN } from "@/utils/status";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import type { InvoiceListItem, OrderStatus } from "@/types/invoice.types";

const ORDER_STATUSES: OrderStatus[] = ["IN_TRANSIT", "RECEIVED", "DISCREPANCY", "VERIFIED", "CLOSED"];

/** Which vendor-workspace tab "View" opens for a given invoice status. RECEIVED
 * has no dedicated read view yet (still a placeholder tab); DISCREPANCY routes
 * into the same warehouse check screen used to resolve it. */
const STATUS_SECTION: Record<OrderStatus, VendorSectionKey> = {
  IN_TRANSIT: "invoicePending",
  RECEIVED: "invoiceReceived",
  DISCREPANCY: "warehouseReceive",
  VERIFIED: "invoiceClosed",
  CLOSED: "invoiceClosed",
};

type SortableColumn = "invoiceNumber" | "orderedAt" | "totalAmount";
const PAGE_SIZE = 10;

/** Every purchase order ever created for this vendor — search/filter/sort/paginate
 * run client-side over the existing GET /invoices/vendor/:vendorId list, which is
 * realistically small per vendor and needs no new backend query support. */
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
  const [sortColumn, setSortColumn] = useState<SortableColumn>("orderedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const resetToFirstPage = () => setPage(1);

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
    const col = column as SortableColumn;
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    resetToFirstPage();
  };

  const handleView = (inv: InvoiceListItem) => {
    onNavigateSection(STATUS_SECTION[inv.status], inv.id);
  };

  const columns: DataTableColumn<InvoiceListItem>[] = [
    {
      key: "invoiceNumber",
      header: "ইনভয়েস নম্বর",
      sortable: true,
      render: (inv) => <span className="font-mono">{inv.invoiceNumber}</span>,
    },
    {
      key: "orderedAt",
      header: "অর্ডার তারিখ",
      sortable: true,
      render: (inv) => <span className="text-gray">{formatBnDate(inv.orderedAt)}</span>,
    },
    {
      key: "itemCount",
      header: "মোট প্রোডাক্ট",
      render: (inv) => `${inv.itemCount} টি`,
    },
    {
      key: "totalAmount",
      header: "গ্র্যান্ড টোটাল",
      sortable: true,
      render: (inv) => <span className="font-mono font-bold">{formatBDT(inv.totalAmount)}</span>,
    },
    {
      key: "status",
      header: "স্ট্যাটাস",
      render: (inv) => <OrderStatusBadge status={inv.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (inv) => (
        <Button type="button" variant="ghost" size="sm" className="ml-auto flex" onClick={() => handleView(inv)}>
          দেখুন
        </Button>
      ),
    },
  ];

  const newOrderButton = (
    <Button type="button" variant="brass" onClick={() => onNavigateSection("newOrder")}>
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
            title="কোনো অর্ডার তৈরি করা হয়নি"
            description="এই ভেন্ডরের জন্য এখনো কোনো পারচেজ অর্ডার তৈরি করা হয়নি।"
            action={
              <Button type="button" variant="brass" className="mt-2" onClick={() => onNavigateSection("newOrder")}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> প্রথম অর্ডার তৈরি করুন
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

      <div className="mb-3.5 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            resetToFirstPage();
          }}
          placeholder="ইনভয়েস নম্বর সার্চ করুন..."
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as OrderStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABEL_BN[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              resetToFirstPage();
            }}
            className="sm:w-40"
            aria-label="শুরুর তারিখ"
          />
          <span className="text-gray">–</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              resetToFirstPage();
            }}
            className="sm:w-40"
            aria-label="শেষ তারিখ"
          />
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={paged}
          rowKey={(inv) => inv.id}
          isLoading={false}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          emptyTitle="কোনো ফলাফল পাওয়া যায়নি"
          emptyDescription="সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
        />
      </Card>
    </>
  );
}
