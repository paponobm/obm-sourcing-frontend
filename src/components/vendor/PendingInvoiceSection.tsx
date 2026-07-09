"use client";

import { Download, Package } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { OrderStepper } from "@/components/vendor/OrderStepper";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useMarkReceived } from "@/hooks/useInvoices";
import { useSectionInvoice } from "@/hooks/useSectionInvoice";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";

const PENDING_STATUSES = ["IN_TRANSIT"] as const;

/** Shows a vendor order that's confirmed but not yet in the warehouse (status
 * IN_TRANSIT) — either a specific `invoiceId` (navigated to from Order History)
 * or, by default, the vendor's most recent pending one. Backed by the real
 * invoices API. */
export function PendingInvoiceSection({
  vendorId,
  invoiceId,
  onNavigateSection,
}: {
  vendorId: string;
  invoiceId?: string;
  onNavigateSection: NavigateToSection;
}) {
  const { invoice, isLoading, hasTarget } = useSectionInvoice(vendorId, PENDING_STATUSES, invoiceId);
  const markReceived = useMarkReceived();

  const handleReceiveGoods = async () => {
    if (!invoice) return;
    await markReceived.mutateAsync(invoice.id);
    onNavigateSection("warehouseReceive", invoice.id);
  };

  const handleDownload = () => {
    toast.success("ইনভয়েস ডাউনলোড শুরু হয়েছে");
  };

  const sectionTitle = (
    <h2 className="m-0 mb-3.5 font-serif text-base text-teal-dark sm:mb-4 sm:text-lg lg:text-[1.1875rem] xl:text-xl">
      ইনভয়েস (পেন্ডিং)
    </h2>
  );

  if (isLoading) {
    return (
      <div>
        {sectionTitle}
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!hasTarget || !invoice) {
    return (
      <div>
        {sectionTitle}
        <Card>
          <EmptyState
            title="কোনো পেন্ডিং ইনভয়েস নেই"
            description="এই ভেন্ডরের জন্য বর্তমানে কোনো অর্ডার 'পেন্ডিং' অবস্থায় নেই।"
          />
        </Card>
      </div>
    );
  }

  const totalProducts = invoice.items.length;
  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.orderedQty, 0);

  return (
    <>
      {sectionTitle}
      <Card>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-4">
          <div>
            <div className="font-mono text-xs text-gray sm:text-sm">INVOICE #{invoice.invoiceNumber}</div>
            <div className="font-serif text-base text-teal-dark sm:text-lg lg:text-xl">{invoice.vendorName}</div>
          </div>
          <div className="text-left text-xs text-gray sm:text-right sm:text-sm">
            <div>অর্ডার তারিখ: {formatBnDate(invoice.orderedAt)}</div>
            <div>অর্ডার করেছেন: {invoice.orderedByName}</div>
            <div className="mt-1">
              স্ট্যাটাস: <OrderStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        <div className="border-b border-line px-4 py-4 sm:px-5">
          <OrderStepper status={invoice.status} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>ভেন্ডর প্রাইস</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
                <TableCell className="font-mono">{formatBDT(item.priceAtOrder)}</TableCell>
                <TableCell>{item.orderedQty}</TableCell>
                <TableCell className="font-mono font-bold">{formatBDT(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3.5 flex flex-col items-end gap-1 text-xs sm:mt-4 sm:text-sm">
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট প্রোডাক্ট</span>
          <span className="font-semibold">{totalProducts} টি</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট কোয়ান্টিটি</span>
          <span className="font-semibold">{totalQuantity} পিস</span>
        </div>
        <div className="flex w-full max-w-xs justify-between border-t border-line pt-1.5 sm:max-w-sm">
          <span className="font-serif text-sm text-teal-dark sm:text-base">গ্র্যান্ড টোটাল</span>
          <span className="font-mono text-base font-bold text-teal-dark sm:text-lg">
            {formatBDT(invoice.totalAmount)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 sm:mt-5">
        <Button type="button" variant="brass" disabled={markReceived.isPending} onClick={handleReceiveGoods}>
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> মাল রিসিভ করুন
        </Button>
        <Button type="button" variant="ghost" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> ইনভয়েস ডাউনলোড (PDF)
        </Button>
      </div>
    </>
  );
}
