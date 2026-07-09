"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { OrderStepper } from "@/components/vendor/OrderStepper";
import { useSectionInvoice } from "@/hooks/useSectionInvoice";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";

const CLOSED_STATUSES = ["CLOSED"] as const;

/** Read-only summary of a fully-closed order — either a specific `invoiceId`
 * (navigated to from Order History) or, by default, the vendor's most recently
 * closed one. Nothing here is editable; Print/PDF/Excel are placeholder actions
 * until export is wired up. */
export function ClosedInvoiceSection({ vendorId, invoiceId }: { vendorId: string; invoiceId?: string }) {
  const { invoice, isLoading, hasTarget } = useSectionInvoice(vendorId, CLOSED_STATUSES, invoiceId);

  const sectionTitle = (
    <h2 className="m-0 mb-3.5 font-serif text-base text-teal-dark sm:mb-4 sm:text-lg lg:text-[1.1875rem] xl:text-xl">
      ইনভয়েস (ক্লোজড)
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
            title="কোনো ক্লোজড ইনভয়েস নেই"
            description="এই ভেন্ডরের জন্য এখনো কোনো অর্ডার সম্পূর্ণ ক্লোজ করা হয়নি।"
          />
        </Card>
      </div>
    );
  }

  const totalProducts = invoice.items.length;
  const totalOrderedQty = invoice.items.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalReceivedQty = invoice.items.reduce((sum, item) => sum + (item.receivedQty ?? 0), 0);

  const handlePrint = () => toast.success("প্রিন্ট শুরু হয়েছে");
  const handleDownloadPdf = () => toast.success("PDF ডাউনলোড শুরু হয়েছে");
  const handleExportExcel = () => toast.success("এক্সেল এক্সপোর্ট শুরু হয়েছে");

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
            {invoice.closedAt && <div>ক্লোজড তারিখ: {formatBnDate(invoice.closedAt)}</div>}
            <div>অর্ডার করেছেন: {invoice.orderedByName}</div>
            <div>ভেরিফাই করেছেন: {invoice.verifiedByName ?? "—"}</div>
            <div className="mt-1">
              স্ট্যাটাস: <OrderStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        <div className="border-b border-line px-4 py-4 sm:px-5">
          <OrderStepper status={invoice.status} />
        </div>

        <div className="flex items-center justify-between px-4 pt-3.5 sm:px-5 sm:pt-4">
          <h3 className="m-0 font-serif text-sm text-teal-dark sm:text-base">ফাইনাল আইটেম</h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>ভেন্ডর প্রাইস</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>রিসিভড QTY</TableHead>
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
                <TableCell className="font-mono">{formatBDT(item.priceAtOrder)}</TableCell>
                <TableCell>{item.orderedQty}</TableCell>
                <TableCell>{item.receivedQty ?? "–"}</TableCell>
                <TableCell className="font-mono font-bold">{formatBDT(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {invoice.notes && (
        <Card className="mt-3.5 sm:mt-4">
          <div className="px-4 py-3.5 sm:px-5 sm:py-4">
            <h3 className="m-0 mb-1.5 font-serif text-sm text-teal-dark sm:text-base">ইন্টারনাল নোট</h3>
            <p className="m-0 whitespace-pre-line text-xs text-gray sm:text-sm">{invoice.notes}</p>
          </div>
        </Card>
      )}

      <div className="mt-3.5 flex flex-col items-end gap-1 text-xs sm:mt-4 sm:text-sm">
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট প্রোডাক্ট</span>
          <span className="font-semibold">{totalProducts} টি</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট অর্ডার Qty</span>
          <span className="font-semibold">{totalOrderedQty} পিস</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট রিসিভড Qty</span>
          <span className="font-semibold">{totalReceivedQty} পিস</span>
        </div>
        <div className="flex w-full max-w-xs justify-between border-t border-line pt-1.5 sm:max-w-sm">
          <span className="font-serif text-sm text-teal-dark sm:text-base">গ্র্যান্ড টোটাল</span>
          <span className="font-mono text-base font-bold text-teal-dark sm:text-lg">
            {formatBDT(invoice.totalAmount)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
        <Button type="button" variant="ghost" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> প্রিন্ট ইনভয়েস
        </Button>
        <Button type="button" variant="ghost" onClick={handleDownloadPdf}>
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> PDF ডাউনলোড
        </Button>
        <Button type="button" variant="ghost" onClick={handleExportExcel}>
          <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> এক্সেল এক্সপোর্ট
        </Button>
      </div>
    </>
  );
}
