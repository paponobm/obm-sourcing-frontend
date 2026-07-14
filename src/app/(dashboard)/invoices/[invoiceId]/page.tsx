"use client";

import { useParams, useRouter } from "next/navigation";
import { Package, Printer } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { OrderStepper } from "@/components/vendor/OrderStepper";
import { InvoicePrintView } from "@/components/invoice/InvoicePrintView";
import { useInvoice, useMarkReceived } from "@/hooks/useInvoices";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import { ROUTES } from "@/constants/routes";

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const markReceived = useMarkReceived();

  const handleStartReceiveCheck = async () => {
    if (invoice?.status === "IN_TRANSIT") {
      await markReceived.mutateAsync(invoiceId);
    }
    router.push(ROUTES.invoiceReceive(invoiceId));
  };

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (!invoice) {
    return <EmptyState title="ইনভয়েস পাওয়া যায়নি" />;
  }

  const isClosed = invoice.status === "CLOSED";
  const showReceivedColumn = invoice.status !== "IN_TRANSIT";

  return (
    <>
      <Breadcrumb
        items={[
          { label: invoice.vendorName, href: ROUTES.vendorDetail(invoice.vendorId) },
          { label: "অর্ডার হিস্টরি", href: ROUTES.vendorDetail(invoice.vendorId) },
          { label: invoice.invoiceNumber },
        ]}
      />

      <Card className="print:hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-4">
          <div>
            <div className="font-mono text-xs text-gray sm:text-sm">
              INVOICE #{invoice.invoiceNumber}
            </div>
            <div className="font-serif text-base text-teal-dark sm:text-lg lg:text-xl">
              {invoice.vendorName}
            </div>
          </div>
          <div className="text-left text-xs text-gray sm:text-right sm:text-sm">
            <div>অর্ডার তারিখ: {formatBnDate(invoice.orderedAt)}</div>
            <div>অর্ডার করেছেন: {invoice.orderedByName}</div>
            {isClosed && invoice.closedAt && <div>ক্লোজড: {formatBnDate(invoice.closedAt)}</div>}
            <div className="mt-1">
              স্ট্যাটাস: <OrderStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        <div className="border-b border-line px-4 py-4 sm:px-5">
          <OrderStepper status={invoice.status} />
        </div>

        <div className="flex items-center justify-between px-4 pt-3.5 sm:px-5 sm:pt-4">
          <h3 className="m-0 font-serif text-sm text-teal-dark sm:text-base">
            {isClosed ? "ফাইনাল আইটেম (অর্ডার = রিসিভড, ম্যাচড)" : "অর্ডার করা আইটেম"}
          </h3>
          <OrderStatusBadge status={invoice.status} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>দাম/পিস</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              {showReceivedColumn && <TableHead>রিসিভড QTY</TableHead>}
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                  {item.productName}
                </TableCell>
                <TableCell className="font-mono text-brass">{formatBDT(item.priceAtOrder)}</TableCell>
                <TableCell>{item.orderedQty}</TableCell>
                {showReceivedColumn && <TableCell>{item.receivedQty ?? "–"}</TableCell>}
                <TableCell className="font-mono font-bold text-brass">{formatBDT(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end border-t border-line px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm text-teal-dark sm:text-base">
              সর্বমোট{isClosed ? " (পরিশোধিত)" : ""}
            </span>
            <span className="font-mono text-base font-bold text-brass sm:text-lg">
              {formatBDT(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </Card>

      <InvoicePrintView invoice={invoice} />

      <div className="mt-4 flex gap-2 print:hidden sm:mt-5">
        {invoice.status === "IN_TRANSIT" && (
          <Button type="button" variant="brass" disabled={markReceived.isPending} onClick={handleStartReceiveCheck}>
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> মাল রিসিভড — চেক শুরু করুন
          </Button>
        )}
        {(invoice.status === "RECEIVED" || invoice.status === "DISCREPANCY") && (
          <Button type="button" variant="brass" onClick={() => router.push(ROUTES.invoiceReceive(invoiceId))}>
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> রিসিভ চেক চালিয়ে যান
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> ইনভয়েস প্রিন্ট/PDF
        </Button>
      </div>
    </>
  );
}
