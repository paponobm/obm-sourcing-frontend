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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useInvoice, useReceiveCheck } from "@/hooks/useInvoices";
import { useCouriers } from "@/hooks/useCouriers";
import { useHasRole } from "@/hooks/useHasRole";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";
import { PAYMENT_STATUS_LABEL_BN } from "@/utils/status";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";
import type { PaymentStatus } from "@/types/invoice.types";
import { OrderStepper } from "@/components/vendor/OrderStepper";

type RowState = { receivedQty: string; remark: string };

const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "UNPAID"];

export default function ReceiveCheckPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const receiveCheck = useReceiveCheck(invoiceId);
  const { data: couriers, isLoading: couriersLoading } = useCouriers();
  const activeCouriers = (couriers ?? []).filter((c) => c.status === "ACTIVE");
  const isManager = useHasRole(["MANAGER"]);

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
  // a truthy check) so an already-saved 0 cost shows as "0", not blank. For
  // Admin, this also folds in any pending Manager-proposed cost (previous +
  // proposed), giving them the right starting point to review/edit before
  // approving — a no-op when nothing's been proposed (the normal fresh
  // RECEIVED/DISCREPANCY screen), so that flow is unaffected.
  // A Manager's own labor/courier cost fields are the exception: they start
  // blank so whatever the Manager types is their own proposed cost (see
  // `submit` below), not a replacement of anything already there.
  useEffect(() => {
    setCourierId(invoice?.courierId ?? "");
    setCourierTouched(false);
    setPaymentStatus(invoice?.paymentStatus ?? "");
    setPaymentStatusTouched(false);
    const combinedLaborCost =
      invoice?.laborCost != null || invoice?.managerLaborCost != null
        ? (invoice?.laborCost ?? 0) + (invoice?.managerLaborCost ?? 0)
        : null;
    const combinedCourierCost =
      invoice?.courierCost != null || invoice?.managerCourierCost != null
        ? (invoice?.courierCost ?? 0) + (invoice?.managerCourierCost ?? 0)
        : null;
    setLaborCost(!isManager && combinedLaborCost != null ? String(combinedLaborCost) : "");
    setLaborCostTouched(false);
    setCourierCost(!isManager && combinedCourierCost != null ? String(combinedCourierCost) : "");
    setCourierCostTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id]);

  // A Manager must actually type the received quantity — no defaulting to
  // "looks matched" — unlike Admin's existing pre-fill-to-ordered-qty flow,
  // which stays unchanged. Either way, an already-saved value always wins.
  const getRow = (itemId: string, orderedQty: number, receivedQty: number | null): RowState =>
    rows[itemId] ?? {
      receivedQty: receivedQty != null ? String(receivedQty) : isManager ? "" : String(orderedQty),
      remark: "",
    };

  const setRow = (itemId: string, patch: Partial<RowState>, orderedQty: number, receivedQty: number | null) => {
    setRows((prev) => ({ ...prev, [itemId]: { ...getRow(itemId, orderedQty, receivedQty), ...patch } }));
  };

  const items = useMemo(() => invoice?.items ?? [], [invoice]);

  const hasMismatch = items.some((it) => {
    const row = getRow(it.id, it.orderedQty, it.receivedQty);
    return Number(row.receivedQty || 0) !== it.orderedQty;
  });

  // Admin's Close Order gate on a Manager-verified invoice — a straight sum
  // comparison (not the per-item "মিল" check above, which stays as its own
  // visual indicator either way).
  const totalOrderedQty = items.reduce((sum, it) => sum + it.orderedQty, 0);
  const totalVerifiedQty = items.reduce((sum, it) => {
    const row = getRow(it.id, it.orderedQty, it.receivedQty);
    return sum + Number(row.receivedQty || 0);
  }, 0);
  const qtyMismatch = totalOrderedQty !== totalVerifiedQty;
  const reviewGrandTotal = (invoice?.totalAmount ?? 0) + (Number(laborCost) || 0) + (Number(courierCost) || 0);

  // If Step 2 (Order Confirm) was skipped, courier/labor cost/courier cost/
  // payment status are all still blank here — the invoice cannot be closed
  // or discrepancy-marked until they're provided, one way or another. A
  // Manager can't set courier/payment status at all (disabled fields, carried
  // through from wherever they were already set, possibly still nothing) —
  // so their own verification only ever needs the two cost fields.
  const missingProcurementInfo = isManager
    ? laborCost.trim() === "" || courierCost.trim() === ""
    : !courierId || laborCost.trim() === "" || courierCost.trim() === "" || !paymentStatus;

  const submit = async (mode: "draft" | "final") => {
    if (!invoice) return;
    if (mode === "final" && missingProcurementInfo) {
      if (!isManager) {
        setCourierTouched(true);
        setPaymentStatusTouched(true);
      }
      setLaborCostTouched(true);
      setCourierCostTouched(true);
      return;
    }
    // A Manager's input is an *additional* cost on top of whatever's already
    // on the invoice — the backend does that addition itself, off the row it
    // fetches fresh at the top of the same request, so it's never at risk of
    // adding to a stale number. This just sends whatever's actually typed.
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

  // Admin reviewing a Manager's own verification — a review + approval
  // screen, distinct from the input screen Admin uses on a fresh
  // RECEIVED/DISCREPANCY invoice (that flow stays completely unchanged below).
  const isAdminReviewingVerified = !isManager && invoice.status === "VERIFIED";

  if (isAdminReviewingVerified) {
    const timelineSteps: { label: string; done: boolean; actor?: string | null; at?: string | null }[] = [
      { label: "অর্ডার তৈরি", done: true, actor: invoice.orderedByName, at: invoice.orderedAt },
      { label: "ভেন্ডর নিশ্চিত করেছে", done: true },
      { label: "পথে আছে", done: true },
      { label: "ওয়্যারহাউজ ভেরিফাইড", done: true, actor: invoice.verifiedByName, at: invoice.verifiedAt },
      { label: "ক্লোজড", done: false },
    ];

    return (
      <>
        <Breadcrumb
          items={[
            { label: invoice.vendorName, href: ROUTES.vendorDetail(invoice.vendorId) },
            { label: invoice.invoiceNumber, href: ROUTES.invoiceDetail(invoiceId) },
            { label: "অ্যাডমিন রিভিউ ও ক্লোজ" },
          ]}
        />

        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:mb-5">
          <h2 className="m-0 font-serif text-base text-teal-dark sm:text-lg lg:text-[1.1875rem] xl:text-xl">
            অ্যাডমিন রিভিউ ও ক্লোজ — {invoice.invoiceNumber}
          </h2>
          <span className="text-xs text-gray sm:text-sm">ম্যানেজার ভেরিফিকেশন সম্পন্ন — চূড়ান্ত অনুমোদনের অপেক্ষায়</span>
        </div>
        <div className="border-b border-line px-4 py-4 sm:px-5 pb-10">
          <OrderStepper status={invoice.status} />
        </div>
        {/* <Card className="mb-3.5 sm:mb-4">
          <CardHeader>
            <CardTitle>টাইমলাইন</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:px-5 sm:py-4">
            {timelineSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    step.done ? "bg-teal text-white" : "bg-paper-2 text-gray",
                  )}
                >
                  {step.done && <Check className="h-3 w-3" />}
                </span>
                <span className={cn(step.done ? "text-ink" : "text-gray")}>{step.label}</span>
                {step.actor && step.at && (
                  <span className="text-gray">
                    — {step.actor} · {formatBnDate(step.at)} {formatBnTime(step.at)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card> */}

        <Card className="mb-3.5 sm:mb-4">
          <CardHeader>
            <CardTitle>ম্যানেজার ভেরিফিকেশন তথ্য</CardTitle>
          </CardHeader>
          {invoice.verifiedAt && (
            <div className="border-b border-line px-4 text-brass py-2.5 text-xs  sm:px-5 sm:text-sm">
              ভেরিফাই করেছেন: <span className="font-mono  font-bold">{invoice.verifiedByName ?? "—"} (Manager)</span>{" "}
              — {formatBnDate(invoice.verifiedAt)} {formatBnTime(invoice.verifiedAt)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 border-b border-line px-4 py-2.5 text-xs sm:grid-cols-4 sm:px-5 sm:text-sm">
            <div>
              <div className="text-gray">পূর্ববর্তী লেবার কস্ট</div>
              <div className="font-mono font-semibold text-ink text-red">{formatBDT(invoice.laborCost ?? 0)}</div>
            </div>
            <div>
              <div className="text-gray">ম্যানেজার যোগ করেছেন (লেবার)</div>
              <div className="font-mono font-semibold text-ink text-red">{formatBDT(invoice.managerLaborCost ?? 0)}</div>
            </div>
            <div>
              <div className="text-gray">পূর্ববর্তী কুরিয়ার কস্ট</div>
              <div className="font-mono font-semibold text-ink text-red ">{formatBDT(invoice.courierCost ?? 0)}</div>
            </div>
            <div>
              <div className="text-gray">ম্যানেজার যোগ করেছেন (কুরিয়ার)</div>
              <div className="font-mono font-semibold text-ink text-red">{formatBDT(invoice.managerCourierCost ?? 0)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 px-4 py-3.5 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-4">
            <div>
              <Label htmlFor="review-courier">কুরিয়ার</Label>
              <SearchableProductSelect
                id="review-courier"
                products={activeCouriers.map((c) => ({ id: c.id, name: c.name }))}
                value={courierId}
                onChange={setCourierId}
                placeholder="কুরিয়ার নির্বাচন করুন..."
                isLoading={couriersLoading}
                emptyMessage="কোনো অ্যাক্টিভ কুরিয়ার পাওয়া যায়নি।"
              />
            </div>
            <div>
              <Label htmlFor="review-payment-status">পেমেন্ট স্ট্যাটাস</Label>
              <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                <SelectTrigger id="review-payment-status">
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
            </div>
            <div>
              <Label htmlFor="review-labor-cost">লেবার কস্ট (অনুমোদনের জন্য মোট)</Label>
              <Input
                id="review-labor-cost"
                type="number"
                min={0}
                placeholder="০"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="review-courier-cost">কুরিয়ার কস্ট (অনুমোদনের জন্য মোট)</Label>
              <Input
                id="review-courier-cost"
                type="number"
                min={0}
                placeholder="০"
                value={courierCost}
                onChange={(e) => setCourierCost(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="mb-3.5 sm:mb-4">
          <CardHeader>
            <CardTitle>ভেরিফাইড কোয়ান্টিটি</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">ক্রমিক</TableHead>
                <TableHead>প্রোডাক্ট</TableHead>
                <TableHead>অর্ডার QTY</TableHead>
                <TableHead>ভেরিফাইড QTY</TableHead>
                <TableHead>মিল</TableHead>
                <TableHead>মন্তব্য</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const row = getRow(item.id, item.orderedQty, item.receivedQty);
                const receivedQty = Number(row.receivedQty || 0);
                const matched = receivedQty === item.orderedQty;

                return (
                  <TableRow key={item.id} className={cn(matched ? "bg-green-soft" : "bg-[#f6e5e2]")}>
                    <TableCell className="text-center font-mono text-gray">{toBnDigits(index + 1)}</TableCell>
                    <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
                    <TableCell className="font-mono">{toBnDigits(item.orderedQty)}</TableCell>
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
                          <X className="h-3.5 w-3.5" /> মিলছে না
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.remark}
                        onChange={(e) =>
                          setRow(item.id, { remark: e.target.value }, item.orderedQty, item.receivedQty)
                        }
                        placeholder="–"
                        className="w-40 sm:w-48"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="mb-3.5 sm:mb-4">
          <CardHeader>
            <CardTitle>খরচের সারাংশ</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-1.5 px-4 py-3.5 text-xs sm:px-5 sm:py-4 sm:text-sm">
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
              <span className="font-serif text-teal-dark">গ্র্যান্ড টোটাল</span>
              <span className="font-mono text-base font-bold text-brass">{formatBDT(reviewGrandTotal)}</span>
            </div>
          </div>
        </Card>

        {qtyMismatch && (
          <div className="mb-3.5 flex gap-2 rounded-md bg-[#f6e5e2] px-3 py-2.5 text-xs text-red sm:mb-4 sm:text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="m-0">Verified quantity must match the ordered quantity before closing this order.</p>
          </div>
        )}

        <div className="flex gap-2">
          <ConfirmDialog
            trigger={
              <Button type="button" variant="brass" disabled={qtyMismatch || receiveCheck.isPending}>
              অর্ডার ক্লোজ করুন
              </Button>
            }
            title="Close this order?"
            description="This action will permanently complete the order and no further editing will be allowed."
            confirmLabel="Confirm & Close"
            cancelLabel="Cancel"
            onConfirm={() => submit("final")}
            isLoading={receiveCheck.isPending}
          />
        </div>
      </>
    );
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
          {invoice.status === "DISCREPANCY"
            ? "ডিসক্রেপান্সি — পুনরায় চেক করুন"
            : invoice.status === "VERIFIED"
              ? "ভেরিফাইড (Manager) — অনুমোদনের অপেক্ষায়"
              : "রিসিভড — চেকিং চলছে"}
        </span>
      </div>

      {invoice.status === "VERIFIED" && invoice.verifiedAt && (
        <div className="mb-3.5 rounded-md bg-paper-2 px-3 py-2.5 text-xs text-ink sm:mb-4 sm:text-sm">
          ভেরিফাই করেছেন: <span className="font-semibold">{invoice.verifiedByName ?? "—"} (Manager)</span> —{" "}
          {formatBnDate(invoice.verifiedAt)}
        </div>
      )}

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
              disabled={isManager}
            />
            {courierTouched && !courierId && (
              <p className="mt-1 text-[11px] text-red sm:text-xs">⚠ একটি কুরিয়ার নির্বাচন করুন।</p>
            )}
          </div>
          <div>
            <Label htmlFor="receive-payment-status">পেমেন্ট স্ট্যাটাস *</Label>
            <Select
              value={paymentStatus}
              disabled={isManager}
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
                  <TableCell className="text-center font-mono text-gray">{toBnDigits(index + 1)}</TableCell>
                  <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                    {item.productName}
                  </TableCell>
                  <TableCell className="font-mono">{toBnDigits(item.orderedQty)}</TableCell>
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
                        {diff < 0
                          ? `কম এসেছে (${toBnDigits(Math.abs(diff))})`
                          : `বেশি এসেছে (${toBnDigits(diff)})`}
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
        {isManager ? (
          <Button type="button" variant="brass" disabled={receiveCheck.isPending} onClick={() => submit("final")}>
            রিসিভ করুন
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant={hasMismatch ? "brass" : "primary"}
              disabled={receiveCheck.isPending}
              onClick={() => submit("final")}
            >
              {hasMismatch
                ? "⚠ ডিসক্রেপান্সি নোট করে সেভ করুন"
                : invoice.status === "VERIFIED"
                  ? "✓ অনুমোদন করে ক্লোজ করুন"
                  : "✓ সব মিলেছে — যাচাই করে ক্লোজ করুন"}
            </Button>
            <Button type="button" variant="ghost" disabled={receiveCheck.isPending} onClick={() => submit("draft")}>
              পরে চেক করবো (Draft সেভ)
            </Button>
          </>
        )}
      </div>
    </>
  );
}
