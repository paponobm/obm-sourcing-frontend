"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import type { InvoiceListItem } from "@/types/invoice.types";
import type { SortDirection } from "@/types/common.types";

export type OrderHistorySortColumn = "invoiceNumber" | "orderedAt" | "totalAmount";
const PAGE_SIZE = 10;

export function OrderHistoryTable({
  invoices,
  total,
  page,
  onPageChange,
  sortColumn,
  sortDirection,
  onSortChange,
  onView,
}: {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  sortColumn: OrderHistorySortColumn;
  sortDirection: SortDirection;
  onSortChange: (column: string) => void;
  onView: (invoice: InvoiceListItem) => void;
}) {
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
      key: "orderedByName",
      header: "তৈরি করেছেন",
      render: (inv) => <span className="text-gray">{inv.orderedByName}</span>,
    },
    {
      key: "updatedAt",
      header: "সর্বশেষ আপডেট",
      render: (inv) => <span className="text-gray">{formatBnDate(inv.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (inv) => (
        <Button type="button" variant="ghost" size="sm" className="ml-auto flex" onClick={() => onView(inv)}>
          দেখুন
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={invoices}
        rowKey={(inv) => inv.id}
        isLoading={false}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        emptyTitle="কোনো ফলাফল পাওয়া যায়নি"
        emptyDescription="সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
      />
    </Card>
  );
}
