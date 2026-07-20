"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, Printer } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchableProductSelect } from "@/components/shared/SearchableProductSelect";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { OrderStepper } from "@/components/vendor/OrderStepper";
import { InvoicePrintView } from "@/components/invoice/InvoicePrintView";
import { useConfirmOrder, useInvoice, useMarkReceived } from "@/hooks/useInvoices";
import { useCouriers } from "@/hooks/useCouriers";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";
import { formatBnDate } from "@/utils/date";
import { PAYMENT_STATUS_LABEL_BN } from "@/utils/status";
import { ROUTES } from "@/constants/routes";
import type { PaymentStatus } from "@/types/invoice.types";

const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "UNPAID"];

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const confirmOrder = useConfirmOrder(invoiceId);
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

  // Pre-fill from the invoice's own current values — `!= null` (not a
  // truthy check) so an already-saved 0 cost shows as "0", not blank.
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

  const missingProcurementInfo =
    !courierId || !paymentStatus || laborCost.trim() === "" || courierCost.trim() === "";

  const handleConfirmOrder = () => {
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

  const handleStartReceiveCheck = async () => {
    if (invoice?.status === "IN_TRANSIT" || invoice?.status === "CONFIRMED") {
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
  const isPreWarehouse = invoice.status === "IN_TRANSIT" || invoice.status === "CONFIRMED";
  const showReceivedColumn = !isPreWarehouse;
  // Pre-warehouse, reflect the (possibly still-editable) labor/courier cost
  // inputs live; from Warehouse Receive onward, the stored procurementCost
  // (or totalAmount before that's finalized) is the source of truth as before.
  const grandTotal = isPreWarehouse
    ? invoice.totalAmount + (Number(laborCost) || 0) + (Number(courierCost) || 0)
    : (invoice.procurementCost ?? invoice.totalAmount);

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

        {/* Step 2 fields — all mandatory to confirm (see missingProcurementInfo).
         * Only editable while still Pending; once confirmed, edit them on
         * the Warehouse Receive page instead. */}
        {invoice.status === "IN_TRANSIT" && (
          <div className="grid grid-cols-1 gap-3 border-b border-line px-4 py-3.5 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-4">
            <div>
              <Label htmlFor="invoice-courier">কুরিয়ার *</Label>
              <SearchableProductSelect
                id="invoice-courier"
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
              <Label htmlFor="invoice-payment-status">পেমেন্ট স্ট্যাটাস *</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => {
                  setPaymentStatus(v as PaymentStatus);
                  setPaymentStatusTouched(false);
                }}
              >
                <SelectTrigger
                  id="invoice-payment-status"
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
              <Label htmlFor="invoice-labor-cost">লেবার কস্ট *</Label>
              <Input
                id="invoice-labor-cost"
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
              <Label htmlFor="invoice-courier-cost">কুরিয়ার কস্ট *</Label>
              <Input
                id="invoice-courier-cost"
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

        <div className="flex items-center justify-between px-4 pt-3.5 sm:px-5 sm:pt-4">
          <h3 className="m-0 font-serif text-sm text-teal-dark sm:text-base">
            {isClosed ? "ফাইনাল আইটেম (অর্ডার = রিসিভড, ম্যাচড)" : "অর্ডার করা আইটেম"}
          </h3>
          <OrderStatusBadge status={invoice.status} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">ক্রমিক</TableHead>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>দাম/পিস</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              {showReceivedColumn && <TableHead>রিসিভড QTY</TableHead>}
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-gray">{index + 1}</TableCell>
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
              {formatBDT(grandTotal)}
            </span>
          </div>
        </div>
      </Card>

      <InvoicePrintView invoice={invoice} />

      <div className="mt-4 flex gap-2 print:hidden sm:mt-5">
        {isPreWarehouse && (
          <Button type="button" variant="brass" disabled={markReceived.isPending} onClick={handleStartReceiveCheck}>
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> মাল রিসিভড — চেক শুরু করুন
          </Button>
        )}
        {/* Step 2 — a plain, optional status change (Pending -> Confirmed).
         * No fields required; courier/costs/payment status can still be
         * filled in now, later, or on the Warehouse Receive page instead. */}
        {invoice.status === "IN_TRANSIT" && (
          <Button type="button" variant="ghost" disabled={confirmOrder.isPending} onClick={handleConfirmOrder}>
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Order Confirm করুন
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
