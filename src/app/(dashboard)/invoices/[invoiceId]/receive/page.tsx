"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Check, X } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchableProductSelect } from "@/components/shared/SearchableProductSelect";
import { useInvoice, useReceiveCheck } from "@/hooks/useInvoices";
import { useCouriers } from "@/hooks/useCouriers";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL_BN } from "@/utils/status";
import type { PaymentStatus } from "@/types/invoice.types";

type RowState = { receivedQty: string; remark: string };

const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "UNPAID"];

export default function ReceiveCheckPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const receiveCheck = useReceiveCheck(invoiceId);
  const { data: couriers, isLoading: couriersLoading } = useCouriers();
  const activeCouriers = (couriers ?? []).filter((c) => c.status === "ACTIVE");

  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [courierId, setCourierId] = useState("");
  const [courierTouched, setCourierTouched] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [paymentStatusTouched, setPaymentStatusTouched] = useState(false);
  const [laborCost, setLaborCost] = useState("");
  const [laborCostTouched, setLaborCostTouched] = useState(false);
  const [courierCost, setCourierCost] = useState("");
  const [courierCostTouched, setCourierCostTouched] = useState(false);

  // Pre-fill from the invoice's own current values (already set via the
  // optional Order Confirm step, or an earlier draft save) — `!= null` (not
  // a truthy check) so an already-saved 0 cost shows as "0", not blank.
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

  const getRow = (itemId: string, orderedQty: number, receivedQty: number | null): RowState =>
    rows[itemId] ?? { receivedQty: String(receivedQty ?? orderedQty), remark: "" };

  const setRow = (itemId: string, patch: Partial<RowState>, orderedQty: number, receivedQty: number | null) => {
    setRows((prev) => ({ ...prev, [itemId]: { ...getRow(itemId, orderedQty, receivedQty), ...patch } }));
  };

  const items = useMemo(() => invoice?.items ?? [], [invoice]);

  const hasMismatch = items.some((it) => {
    const row = getRow(it.id, it.orderedQty, it.receivedQty);
    return Number(row.receivedQty || 0) !== it.orderedQty;
  });

  // If Step 2 (Order Confirm) was skipped, courier/labor cost/courier cost/
  // payment status are all still blank here — the invoice cannot be closed
  // or discrepancy-marked until they're provided, one way or another.
  const missingProcurementInfo =
    !courierId || laborCost.trim() === "" || courierCost.trim() === "" || !paymentStatus;

  const submit = async (mode: "draft" | "final") => {
    if (!invoice) return;
    if (mode === "final" && missingProcurementInfo) {
      setCourierTouched(true);
      setLaborCostTouched(true);
      setCourierCostTouched(true);
      setPaymentStatusTouched(true);
      return;
    }
    await receiveCheck.mutateAsync({
      mode,
      items: items.map((it) => {
        const row = getRow(it.id, it.orderedQty, it.receivedQty);
        return { itemId: it.id, receivedQty: Number(row.receivedQty || 0), remark: row.remark || undefined };
      }),
      courierId,
      laborCost: Math.max(0, Number(laborCost) || 0),
      courierCost: Math.max(0, Number(courierCost) || 0),
      paymentStatus: paymentStatus || undefined,
    });
    router.push(ROUTES.invoiceDetail(invoiceId));
  };

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (!invoice) {
    return <EmptyState title="ইনভয়েস পাওয়া যায়নি" />;
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: invoice.vendorName, href: ROUTES.vendorDetail(invoice.vendorId) },
          { label: invoice.invoiceNumber, href: ROUTES.invoiceDetail(invoiceId) },
          { label: "ওয়্যারহাউজ রিসিভ চেক" },
        ]}
      />

      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:mb-5">
        <h2 className="m-0 font-serif text-base text-teal-dark sm:text-lg lg:text-[1.1875rem] xl:text-xl">
          মাল রিসিভ চেক — {invoice.invoiceNumber}
        </h2>
        <span className="text-xs text-gray sm:text-sm">
          {invoice.status === "DISCREPANCY" ? "ডিসক্রেপান্সি — পুনরায় চেক করুন" : "রিসিভড — চেকিং চলছে"}
        </span>
      </div>

      <Card className="mb-3.5 sm:mb-4">
        <CardHeader>
          <CardTitle>প্রোকিউরমেন্ট তথ্য</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 px-4 py-3.5 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-4">
          <div>
            <Label htmlFor="receive-courier">কুরিয়ার *</Label>
            <SearchableProductSelect
              id="receive-courier"
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
            <Label htmlFor="receive-payment-status">পেমেন্ট স্ট্যাটাস *</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => {
                setPaymentStatus(v as PaymentStatus);
                setPaymentStatusTouched(false);
              }}
            >
              <SelectTrigger
                id="receive-payment-status"
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
            <Label htmlFor="receive-labor-cost">লেবার কস্ট *</Label>
            <Input
              id="receive-labor-cost"
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
            <Label htmlFor="receive-courier-cost">কুরিয়ার কস্ট *</Label>
            <Input
              id="receive-courier-cost"
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>অর্ডার করা Qty বনাম রিসিভ করা Qty মিলিয়ে দেখুন</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">ক্রমিক</TableHead>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>রিসিভড QTY</TableHead>
              <TableHead>মিল</TableHead>
              <TableHead>মন্তব্য</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const row = getRow(item.id, item.orderedQty, item.receivedQty);
              const receivedQty = Number(row.receivedQty || 0);
              const diff = receivedQty - item.orderedQty;
              const matched = diff === 0;

              return (
                <TableRow key={item.id} className={cn(matched ? "bg-green-soft" : "bg-[#f6e5e2]")}>
                  <TableCell className="text-center text-gray">{index + 1}</TableCell>
                  <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                    {item.productName}
                  </TableCell>
                  <TableCell>{item.orderedQty}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={row.receivedQty}
                      onChange={(e) =>
                        setRow(item.id, { receivedQty: e.target.value }, item.orderedQty, item.receivedQty)
                      }
                      className="w-20 sm:w-24"
                    />
                  </TableCell>
                  <TableCell>
                    {matched ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-green">
                        <Check className="h-3.5 w-3.5" /> ঠিক আছে
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red">
                        <X className="h-3.5 w-3.5" />
                        {diff < 0 ? `কম এসেছে (${Math.abs(diff)})` : `বেশি এসেছে (${diff})`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.remark}
                      onChange={(e) => setRow(item.id, { remark: e.target.value }, item.orderedQty, item.receivedQty)}
                      placeholder={matched ? "–" : "ভেন্ডরকে জানাতে হবে"}
                      className="w-40 sm:w-48"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3.5 flex gap-2 rounded-md bg-brass-soft px-3 py-2.5 text-xs text-brass sm:mt-4 sm:text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="m-0">
          কোনো প্রোডাক্টের অর্ডার Qty আর রিসিভড Qty না মিললে সিস্টেম স্বয়ংক্রিয়ভাবে &ldquo;ডিসক্রেপান্সি&rdquo; হিসেবে
          ফ্ল্যাগ করবে এবং ইনভয়েস ক্লোজ করার আগে রিভিউ চাইবে।
        </p>
      </div>

      <div className="mt-4 flex gap-2 sm:mt-5">
        <Button
          type="button"
          variant={hasMismatch ? "brass" : "primary"}
          disabled={receiveCheck.isPending}
          onClick={() => submit("final")}
        >
          {hasMismatch ? "⚠ ডিসক্রেপান্সি নোট করে সেভ করুন" : "✓ সব মিলেছে — যাচাই করে ক্লোজ করুন"}
        </Button>
        <Button type="button" variant="ghost" disabled={receiveCheck.isPending} onClick={() => submit("draft")}>
          পরে চেক করবো (Draft সেভ)
        </Button>
      </div>
    </>
  );
}
