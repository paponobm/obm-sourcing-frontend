import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import type { VendorSectionKey } from "@/components/vendor/VendorSectionTabs";
import { ROUTES } from "@/constants/routes";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import type { OrderListItem } from "@/types/order.types";
import type { OrderStatus } from "@/types/invoice.types";

/** Which vendor-workspace tab "View" opens for a given order status — a
 * deliberate duplicate of OrderHistorySection.tsx's identical mapping (kept
 * local rather than shared, since VendorSectionKey lives in a component file
 * and this is only 5 lines). RECEIVED/DISCREPANCY both need the warehouse
 * check screen; VERIFIED/CLOSED both land on the closed-invoice summary. */
const STATUS_SECTION: Record<OrderStatus, VendorSectionKey> = {
  IN_TRANSIT: "invoicePending",
  CONFIRMED: "invoicePending",
  RECEIVED: "warehouseReceive",
  DISCREPANCY: "warehouseReceive",
  VERIFIED: "invoiceClosed",
  CLOSED: "invoiceClosed",
};

export function OrdersTable({
  orders,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  viewHref,
}: {
  orders: OrderListItem[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Overrides the "দেখুন" action link and disables the vendor-name link —
   * used for the Manager's Order Management view, which routes into the
   * standalone /invoices/[invoiceId] page instead of the vendor workspace
   * (Manager has no Vendor Management access). Admin usage omits this, so
   * its vendor-tab-based navigation is unchanged. */
  viewHref?: (order: OrderListItem) => string;
}) {
  const columns: DataTableColumn<OrderListItem>[] = [
    {
      key: "invoiceNumber",
      header: "ইনভয়েস নম্বর",
      render: (o) => <span className="font-mono">{o.invoiceNumber}</span>,
    },
    {
      key: "vendorName",
      header: "ভেন্ডর",
      render: (o) =>
        viewHref ? (
          <div>
            <div className="text-sm md:text-base">{o.vendorName}</div>
            <div className="font-mono text-xs text-gray">{o.vendorCode}</div>
          </div>
        ) : (
          <Link href={ROUTES.vendorDetail(o.vendorId)} className="hover:underline">
            <div className="text-sm md:text-base">{o.vendorName}</div>
            <div className="font-mono text-xs text-gray">{o.vendorCode}</div>
          </Link>
        ),
    },
    {
      key: "orderedAt",
      header: "অর্ডার তারিখ",
      render: (o) => <span className="text-gray">{formatBnDate(o.orderedAt)}</span>,
    },
    {
      key: "itemCount",
      header: "মোট প্রোডাক্ট",
      render: (o) => `${o.itemCount} টি`,
    },
    {
      key: "totalAmount",
      header: "গ্র্যান্ড টোটাল",
      render: (o) => (
        <span className="font-mono font-bold text-brass">{formatBDT(o.procurementCost ?? o.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "স্ট্যাটাস",
      render: (o) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <OrderStatusBadge status={o.status} />
          {o.managerDraftAt && <Badge variant="low">ম্যানেজার ড্রাফট</Badge>}
        </div>
      ),
    },
    {
      key: "orderedByName",
      header: "তৈরি করেছেন",
      render: (o) => <span className="text-gray">{o.orderedByName}</span>,
    },
    {
      key: "updatedAt",
      header: "সর্বশেষ আপডেট",
      render: (o) => <span className="text-gray">{formatBnDate(o.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (o) => (
        <Button asChild type="button" variant="ghost" size="sm" className="ml-auto flex">
          <Link href={viewHref ? viewHref(o) : `${ROUTES.vendorDetail(o.vendorId)}?tab=${STATUS_SECTION[o.status]}&invoiceId=${o.id}`}>
            দেখুন
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={orders}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        emptyTitle="কোনো পারচেজ অর্ডার পাওয়া যায়নি"
        emptyDescription="সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
      />
    </Card>
  );
}
