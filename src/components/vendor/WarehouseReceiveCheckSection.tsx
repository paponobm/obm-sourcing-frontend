"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUp, Check, Info, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SearchableProductSelect } from "@/components/shared/SearchableProductSelect";
import { StatRow } from "@/components/dashboard/StatRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useReceiveCheck } from "@/hooks/useInvoices";
import { useSectionInvoice } from "@/hooks/useSectionInvoice";
import { useCouriers } from "@/hooks/useCouriers";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";
import { PAYMENT_STATUS_LABEL_BN } from "@/utils/status";
import type { PaymentStatus } from "@/types/invoice.types";

const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "UNPAID"];

const WAREHOUSE_STATUSES = ["RECEIVED", "DISCREPANCY"] as const;

type RowState = { receivedQty: string; remark: string };
type RowStatus = "pending" | "matched" | "short" | "over";

/** Empty input = warehouse staff hasn't counted this product yet — "pending" is
 * deliberately not treated as a mismatch (0 vs ordered) so an untouched row
 * doesn't read as a shortage before anyone has looked at it. */
function getRowStatus(receivedQtyRaw: string, orderedQty: number): RowStatus {
  if (receivedQtyRaw.trim() === "") return "pending";
  const receivedQty = Number(receivedQtyRaw);
  if (receivedQty === orderedQty) return "matched";
  return receivedQty < orderedQty ? "short" : "over";
}

const ROW_BG: Record<RowStatus, string> = {
  pending: "",
  matched: "bg-green-soft",
  short: "bg-[#f6e5e2]",
  over: "bg-brass-soft",
};

/** Warehouse-side quantity verification for a vendor's order — the step between
 * "মাল রিসিভ করুন" (Pending Invoice tab) and the order being closed. Operates on
 * whichever of the vendor's invoices is RECEIVED or DISCREPANCY via the real
 * PATCH /invoices/:id/receive-check endpoint (draft or final mode). */
export function WarehouseReceiveCheckSection({
  vendorId,
  invoiceId,
  onNavigateSection,
}: {
  vendorId: string;
  invoiceId?: string;
  onNavigateSection?: NavigateToSection;
}) {
  const { invoice, isLoading, hasTarget } = useSectionInvoice(vendorId, WAREHOUSE_STATUSES, invoiceId);
  const receiveCheck = useReceiveCheck(invoice?.id ?? "");
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
  // optional Order Confirm step, or an earlier draft save on this same page)
  // each time a different invoice is loaded — never stomps on it afterward
  // while the admin is actively editing, since this only re-runs when the
  // invoice id changes. `!= null` (not a truthy check) so an already-saved
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

  const items = invoice?.items ?? [];

  // Only pre-fill from a value the warehouse actually recorded before (e.g.
  // re-opening a DISCREPANCY invoice) — never from orderedQty, so a fresh row
  // starts blank and forces a real count rather than silently assuming a match.
  const getRow = (itemId: string, receivedQty: number | null): RowState =>
    rows[itemId] ?? { receivedQty: receivedQty !== null ? String(receivedQty) : "", remark: "" };

  const setRow = (itemId: string, patch: Partial<RowState>, receivedQty: number | null) => {
    setRows((prev) => ({ ...prev, [itemId]: { ...getRow(itemId, receivedQty), ...patch } }));
  };

  const rowsWithStatus = items.map((item) => {
    const row = getRow(item.id, item.receivedQty);
    const status = getRowStatus(row.receivedQty, item.orderedQty);
    const receivedQtyNum = status === "pending" ? 0 : Number(row.receivedQty);
    return { item, row, receivedQtyNum, status };
  });

  const totalProducts = rowsWithStatus.length;
  const matchedCount = rowsWithStatus.filter((r) => r.status === "matched").length;
  const shortCount = rowsWithStatus.filter((r) => r.status === "short").length;
  const overCount = rowsWithStatus.filter((r) => r.status === "over").length;
  const pendingCount = rowsWithStatus.filter((r) => r.status === "pending").length;
  const hasMismatch = shortCount > 0 || overCount > 0;
  const hasPending = pendingCount > 0;

  const finalProcurementCost = (invoice?.totalAmount ?? 0) + (Number(laborCost) || 0) + (Number(courierCost) || 0);

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
    const updated = await receiveCheck.mutateAsync({
      mode,
      items: rowsWithStatus.map(({ item, row, receivedQtyNum }) => ({
        itemId: item.id,
        receivedQty: receivedQtyNum,
        remark: row.remark || undefined,
      })),
      courierId,
      laborCost: Math.max(0, Number(laborCost) || 0),
      courierCost: Math.max(0, Number(courierCost) || 0),
      paymentStatus: paymentStatus || undefined,
    });
    setRows({});
    if (mode === "final" && updated.status === "CLOSED") {
      onNavigateSection?.("invoiceClosed", updated.id);
    }
  };

  const sectionTitle = (
    <h2 className="m-0 mb-3.5 font-serif text-base text-teal-dark sm:mb-4 sm:text-lg lg:text-[1.1875rem] xl:text-xl">
      ওয়্যারহাউজ রিসিভ চেক
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
            title="চেক করার মতো কোনো ইনভয়েস নেই"
            description="'ইনভয়েস (পেন্ডিং)' ট্যাব থেকে মাল রিসিভড হিসেবে চিহ্নিত হলে সেই ইনভয়েস এখানে ওয়্যারহাউজ চেকের জন্য দেখাবে।"
          />
        </Card>
      </div>
    );
  }

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
            <div>
              স্ট্যাটাস: <OrderStatusBadge status={invoice.status} />
            </div>
            <div className="mt-1">পর্যায়: গুডস রিসিভিং</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-line px-4 py-3.5 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-4">
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

        <div className="flex flex-col gap-1 border-b border-line px-4 py-3.5 text-xs sm:px-5 sm:py-4 sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray">প্রোডাক্ট টোটাল</span>
            <span className="font-mono">{formatBDT(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">লেবার কস্ট</span>
            <span className="font-mono">{formatBDT(Number(laborCost) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">কুরিয়ার কস্ট</span>
            <span className="font-mono">{formatBDT(Number(courierCost) || 0)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5">
            <span className="font-serif text-teal-dark">সর্বমোট প্রোকিউরমেন্ট কস্ট</span>
            <span className="font-mono font-bold text-brass">{formatBDT(finalProcurementCost)}</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>রিসিভড QTY</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>মন্তব্য</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsWithStatus.map(({ item, row, receivedQtyNum, status }) => {
              const diff = receivedQtyNum - item.orderedQty;
              return (
                <TableRow key={item.id} className={ROW_BG[status]}>
                  <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
                  <TableCell>{item.orderedQty}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      placeholder="লিখুন"
                      value={row.receivedQty}
                      onChange={(e) => setRow(item.id, { receivedQty: e.target.value }, item.receivedQty)}
                      className="w-20 sm:w-24"
                    />
                  </TableCell>
                  <TableCell>
                    {status === "pending" && <span className="text-gray">এন্ট্রি বাকি</span>}
                    {status === "matched" && (
                      <span className="inline-flex items-center gap-1 font-semibold text-green">
                        <Check className="h-3.5 w-3.5" /> পুরোপুরি মিলেছে
                      </span>
                    )}
                    {status === "short" && (
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-red">
                          <X className="h-3.5 w-3.5" /> কম রিসিভড
                        </span>
                        <div className="text-[11px] text-red sm:text-xs">
                          ঘাটতি: {Math.abs(diff)} {item.unit}
                        </div>
                      </div>
                    )}
                    {status === "over" && (
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-brass">
                          <ArrowUp className="h-3.5 w-3.5" /> বেশি রিসিভড
                        </span>
                        <div className="text-[11px] text-brass sm:text-xs">
                          অতিরিক্ত: {diff} {item.unit}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.remark}
                      onChange={(e) => setRow(item.id, { remark: e.target.value }, item.receivedQty)}
                      placeholder={status === "matched" ? "–" : "ভেন্ডরকে জানাতে হবে"}
                      className="w-40 sm:w-48"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3.5 sm:mt-4">
        <StatRow>
          <StatCard label="মোট প্রোডাক্ট" value={String(totalProducts)} />
          <StatCard label="মিলেছে" value={String(matchedCount)} />
          <StatCard
            label="কম রিসিভড"
            value={String(shortCount)}
            delta={shortCount > 0 ? "রিভিউ প্রয়োজন" : undefined}
            deltaVariant="brass"
          />
          <StatCard
            label="বেশি রিসিভড"
            value={String(overCount)}
            delta={overCount > 0 ? "রিভিউ প্রয়োজন" : undefined}
            deltaVariant="brass"
          />
        </StatRow>
      </div>

      {hasPending && (
        <div className="mb-3.5 flex gap-2 rounded-md bg-paper-2 px-3 py-2.5 text-xs text-gray sm:mb-4 sm:text-sm">
          <Info className="h-4 w-4 shrink-0" />
          <p className="m-0">
            {pendingCount} টি প্রোডাক্টের রিসিভড Qty এখনো লেখা হয়নি — ভেরিফাই করার আগে সবগুলো পূরণ করুন।
          </p>
        </div>
      )}

      {hasMismatch && (
        <div className="mb-3.5 flex gap-2 rounded-md bg-brass-soft px-3 py-2.5 text-xs text-brass sm:mb-4 sm:text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="m-0">
            কিছু প্রোডাক্টের কোয়ান্টিটি মিলছে না। সব ডিসক্রেপান্সি সমাধান না হওয়া পর্যন্ত এই ইনভয়েস ভেরিফাই করা যাবে না।
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="ghost" disabled={receiveCheck.isPending} onClick={() => submit("draft")}>
          Draft সেভ করুন
        </Button>
        {hasMismatch ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="brass" disabled={receiveCheck.isPending || hasPending}>
                ⚠ ডিসক্রেপান্সি নোট করে সাবমিট করুন
              </Button>
            }
            title="কোয়ান্টিটি মিসম্যাচ নিয়ে সাবমিট করবেন?"
            description="কিছু প্রোডাক্টের রিসিভড Qty অর্ডার করা Qty-র সাথে মিলছে না। সাবমিট করলে এই ইনভয়েস 'ডিসক্রেপান্সি' হিসেবে চিহ্নিত হবে।"
            confirmLabel="সাবমিট করুন"
            onConfirm={() => submit("final")}
            isLoading={receiveCheck.isPending}
          />
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={receiveCheck.isPending || hasPending}
            onClick={() => submit("final")}
          >
            ✓ গুডস রিসিপ্ট ভেরিফাই করুন
          </Button>
        )}
      </div>
    </>
  );
}
