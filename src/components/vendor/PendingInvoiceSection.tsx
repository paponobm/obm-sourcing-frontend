"use client";

import { useEffect, useState } from "react";
import { Download, Package, CheckCircle2, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchableProductSelect } from "@/components/shared/SearchableProductSelect";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { OrderStepper } from "@/components/vendor/OrderStepper";
import { InvoicePrintView } from "@/components/invoice/InvoicePrintView";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useConfirmOrder, useMarkReceived } from "@/hooks/useInvoices";
import { useSectionInvoice } from "@/hooks/useSectionInvoice";
import { useCouriers } from "@/hooks/useCouriers";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import { PAYMENT_STATUS_LABEL_BN } from "@/utils/status";
import type { PaymentStatus } from "@/types/invoice.types";

// Confirmed is still pre-warehouse — same "Pending Invoice" view handles
// both, exactly like the existing invoice page always has for its one
// Pending status; Confirmed is just an additional sub-state of it.
const PENDING_STATUSES = ["IN_TRANSIT", "CONFIRMED"] as const;
const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "UNPAID"];

/** Shows a vendor order that hasn't reached the warehouse yet — either a
 * specific `invoiceId` (navigated to from Order History) or, by default, the
 * vendor's most recent Pending/Confirmed one. Backed by the real invoices
 * API. Courier/labor cost/courier cost/payment status are all mandatory to
 * fill in here before "Order Confirm করুন" will move the status to
 * Confirmed — confirming locks in the procurement info right then. */
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
  const confirmOrder = useConfirmOrder(invoice?.id ?? "");
  const markReceived = useMarkReceived();
  const { data: couriers, isLoading: couriersLoading } = useCouriers();
  const activeCouriers = (couriers ?? []).filter((c) => c.status === "ACTIVE");

  const [courierId, setCourierId] = useState("");
  const [courierTouched, setCourierTouched] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [paymentStatusTouched, setPaymentStatusTouched] = useState(false);
  const [laborCost, setLaborCost] = useState("");
  const [laborCostTouched, setLaborCostTouched] = useState(false);
  const [courierCost, setCourierCost] = useState("");
  const [courierCostTouched, setCourierCostTouched] = useState(false);

  // Pre-fill from the invoice's own current values each time a different
  // invoice is loaded — `!= null` (not a truthy check) so an already-saved
  // 0 cost shows as "0", not blank.
  useEffect(() => {
    setCourierId(invoice?.courierId ?? "");
    setCourierTouched(false);
    setPaymentStatus(invoice?.paymentStatus ?? "");
    setPaymentStatusTouched(false);
    setLaborCost(invoice?.laborCost != null ? String(invoice.laborCost) : "");
    setLaborCostTouched(false);
    setCourierCost(invoice?.courierCost != null ? String(invoice.courierCost) : "");
    setCourierCostTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id]);

  const grandTotal = (invoice?.totalAmount ?? 0) + (Number(laborCost) || 0) + (Number(courierCost) || 0);

  const missingProcurementInfo =
    !courierId || !paymentStatus || laborCost.trim() === "" || courierCost.trim() === "";

  const handleConfirmOrder = () => {
    if (!invoice) return;
    if (missingProcurementInfo) {
      setCourierTouched(true);
      setPaymentStatusTouched(true);
      setLaborCostTouched(true);
      setCourierCostTouched(true);
      return;
    }
    confirmOrder.mutate({
      courierId,
      paymentStatus: paymentStatus as PaymentStatus,
      laborCost: Math.max(0, Number(laborCost) || 0),
      courierCost: Math.max(0, Number(courierCost) || 0),
    });
  };

  const handleReceiveGoods = async () => {
    if (!invoice) return;
    await markReceived.mutateAsync(invoice.id);
    onNavigateSection("warehouseReceive", invoice.id);
  };

  // Browser's native print — "Save as PDF" in that same dialog covers the
  // download case too. The app shell and this button row are hidden for
  // print via `print:hidden` so only the invoice itself renders.
  const handleDownload = () => window.print();

  const sectionTitle = (
    <h2 className="m-0 mb-3.5 font-serif text-base text-teal-dark print:hidden sm:mb-4 sm:text-lg lg:text-[1.1875rem] xl:text-xl">
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
      <div className="print:hidden border-b border-line px-4 py-4 sm:px-5 pb-10">
        <OrderStepper status={invoice.status} />
      </div>
      <Card className="print:hidden">

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

        {/* <div className="border-b border-line px-4 py-4 sm:px-5">
          <OrderStepper status={invoice.status} />
        </div> */}

        {/* Step 2 fields — all mandatory to confirm (see missingProcurementInfo).
         * Only editable while still Pending; once confirmed, edit them on
         * the Warehouse Receive page instead. */}
        {invoice.status === "IN_TRANSIT" && (
          <div className="grid grid-cols-1 gap-3 border-b border-line px-4 py-3.5 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-4">
            <div>
              <Label htmlFor="pending-courier">কুরিয়ার *</Label>
              <SearchableProductSelect
                id="pending-courier"
                products={activeCouriers.map((c) => ({ id: c.id, name: c.name }))}
                value={courierId}
                onChange={(id) => {
                  setCourierId(id);
                  if (id) setCourierTouched(false);
                }}
                placeholder="কুরিয়ার নির্বাচন করুন..."
                isLoading={couriersLoading}
                invalid={courierTouched && !courierId}
                emptyMessage="কোনো অ্যাক্টিভ কুরিয়ার পাওয়া যায়নি।"
              />
              {courierTouched && !courierId && (
                <p className="mt-1 text-[11px] text-red sm:text-xs">⚠ একটি কুরিয়ার নির্বাচন করুন।</p>
              )}
            </div>
            <div>
              <Label htmlFor="pending-payment-status">পেমেন্ট স্ট্যাটাস *</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => {
                  setPaymentStatus(v as PaymentStatus);
                  setPaymentStatusTouched(false);
                }}
              >
                <SelectTrigger
                  id="pending-payment-status"
                  className={cn(paymentStatusTouched && !paymentStatus && "border-red")}
                >
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_STATUS_LABEL_BN[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {paymentStatusTouched && !paymentStatus && (
                <p className="mt-1 text-[11px] text-red sm:text-xs">⚠ পেমেন্ট স্ট্যাটাস নির্বাচন করুন।</p>
              )}
            </div>
            <div>
              <Label htmlFor="pending-labor-cost">লেবার কস্ট *</Label>
              <Input
                id="pending-labor-cost"
                type="number"
                min={0}
                placeholder="০"
                value={laborCost}
                invalid={laborCostTouched && laborCost.trim() === ""}
                onChange={(e) => {
                  setLaborCost(e.target.value);
                  if (e.target.value.trim() !== "") setLaborCostTouched(false);
                }}
              />
              {laborCostTouched && laborCost.trim() === "" && (
                <p className="mt-1 text-[11px] text-red sm:text-xs">⚠ লেবার কস্ট লিখুন (না থাকলে ০)।</p>
              )}
            </div>
            <div>
              <Label htmlFor="pending-courier-cost">কুরিয়ার কস্ট *</Label>
              <Input
                id="pending-courier-cost"
                type="number"
                min={0}
                placeholder="০"
                value={courierCost}
                invalid={courierCostTouched && courierCost.trim() === ""}
                onChange={(e) => {
                  setCourierCost(e.target.value);
                  if (e.target.value.trim() !== "") setCourierCostTouched(false);
                }}
              />
              {courierCostTouched && courierCost.trim() === "" && (
                <p className="mt-1 text-[11px] text-red sm:text-xs">⚠ কুরিয়ার কস্ট লিখুন (না থাকলে ০)।</p>
              )}
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">ক্রমিক</TableHead>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>ভেন্ডর প্রাইস</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-gray">{index + 1}</TableCell>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
                <TableCell className="font-mono text-brass">{formatBDT(item.priceAtOrder)}</TableCell>
                <TableCell>{item.orderedQty}</TableCell>
                <TableCell className="font-mono font-bold text-brass">{formatBDT(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3.5 flex flex-col items-end gap-1 text-xs print:hidden sm:mt-4 sm:text-sm">
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট প্রোডাক্ট</span>
          <span className="font-mono">{totalProducts} টি</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট কোয়ান্টিটি</span>
          <span className="font-mono">{totalQuantity} পিস</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">প্রোডাক্ট টোটাল</span>
          <span className="font-mono">{formatBDT(invoice.totalAmount)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">লেবার কস্ট</span>
          <span className="font-mono">{formatBDT(Number(laborCost) || 0)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">কুরিয়ার কস্ট</span>
          <span className="font-mono ">{formatBDT(Number(courierCost) || 0)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between border-t border-line pt-1.5 sm:max-w-sm">
          <span className="font-serif text-sm text-teal-dark sm:text-base">গ্র্যান্ড টোটাল</span>
          <span className="font-mono text-base font-bold text-brass sm:text-lg">{formatBDT(grandTotal)}</span>
        </div>
      </div>

      <InvoicePrintView invoice={invoice} />

      {/* Set via "Order Confirm করুন" — shown read-only here once confirmed;
       * editable again on the Warehouse Receive page if it ever needs
       * correcting. */}
      {invoice.courierName && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 print:hidden sm:mt-4">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-default items-center gap-1.5 rounded-md border border-line bg-paper-2 px-2.5 py-1.5 text-xs text-ink sm:text-sm">
                  <span className="font-medium">কুরিয়ার নাম:</span>
                  <span>{invoice.courierName}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div>মোবাইল: {invoice.courierPrimaryMobile}</div>
                <div>লোকেশন: {invoice.courierLocation}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
           <span className="font-medium">পেমেন্ট স্ট্যাটাস:</span>
          {invoice.paymentStatus && (
            
            <Badge variant={invoice.paymentStatus === "PAID" ? "active" : "low"}>

            {PAYMENT_STATUS_LABEL_BN[invoice.paymentStatus]}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2 print:hidden sm:mt-5">
        {/* Receiving only makes sense once the order's been confirmed — while
         * still Pending, confirm it first. */}
        {invoice.status === "CONFIRMED" && (
          <Button type="button" variant="brass" disabled={markReceived.isPending} onClick={handleReceiveGoods}>
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />প্রোডাক্ট রিসিভ করুন
          </Button>
        )}
        {/* Step 2 — courier/costs/payment status above are all mandatory;
         * clicking this while any are missing just marks them invalid. */}
        {invoice.status === "IN_TRANSIT" && (
          <Button type="button" variant="brass" disabled={confirmOrder.isPending} onClick={handleConfirmOrder}>
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />ভেন্ডর Order Confirm করেছেন
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> ইনভয়েস ডাউনলোড (PDF)
        </Button>
      </div>
    </>
  );
}
