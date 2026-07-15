"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { ROUTES } from "@/constants/routes";
import { formatBnDate, toBnDigits } from "@/utils/date";
import type { RequisitionOrderHistoryRow } from "@/types/requisition.types";
import type { SortDirection } from "@/types/common.types";

export type RequisitionOrderHistorySortColumn = "requisitionCode" | "orderedAt";
const PAGE_SIZE = 10;

export function RequisitionOrderHistoryTable({
  rows,
  total,
  page,
  onPageChange,
  sortColumn,
  sortDirection,
  onSortChange,
}: {
  rows: RequisitionOrderHistoryRow[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  sortColumn: RequisitionOrderHistorySortColumn;
  sortDirection: SortDirection;
  onSortChange: (column: string) => void;
}) {
  const columns: DataTableColumn<RequisitionOrderHistoryRow>[] = [
    {
      key: "requisitionCode",
      header: "রিকুইজিশন আইডি",
      sortable: true,
      render: (r) => <span className="font-mono text-xs sm:text-sm">{r.requisitionCode}</span>,
    },
    {
      key: "vendorName",
      header: "ভেন্ডর",
      render: (r) => (
        <Link href={ROUTES.vendorDetail(r.vendorId)} className="hover:underline">
          {r.vendorName}
        </Link>
      ),
    },
    {
      key: "products",
      header: "প্রোডাক্ট",
      render: (r) => r.items.map((i) => i.productName).join(", "),
    },
    {
      key: "quantity",
      header: "পরিমাণ",
      render: (r) => `${toBnDigits(r.items.reduce((sum, i) => sum + i.orderedQty, 0))} টি`,
    },
    { key: "orderedAt", header: "অর্ডার তারিখ", sortable: true, render: (r) => <span className="text-gray">{formatBnDate(r.orderedAt)}</span> },
    {
      key: "receivedAt",
      header: "ডেলিভারি তারিখ",
      render: (r) => <span className="text-gray">{r.receivedAt ? formatBnDate(r.receivedAt) : "–"}</span>,
    },
    { key: "status", header: "স্ট্যাটাস", render: (r) => <OrderStatusBadge status={r.status} /> },
    {
      key: "invoiceNumber",
      header: "ইনভয়েস / PO নম্বর",
      render: (r) => (
        <Link href={ROUTES.invoiceDetail(r.invoiceId)} className="font-mono text-teal hover:underline">
          {r.invoiceNumber}
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => `${r.requisitionId}_${r.invoiceId}`}
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
