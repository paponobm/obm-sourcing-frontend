"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUp, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatRow } from "@/components/dashboard/StatRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useReceiveCheck } from "@/hooks/useInvoices";
import { useSectionInvoice } from "@/hooks/useSectionInvoice";

const WAREHOUSE_STATUSES = ["RECEIVED", "DISCREPANCY"] as const;

type RowState = { receivedQty: string; remark: string };
type RowStatus = "matched" | "short" | "over";

function getRowStatus(receivedQty: number, orderedQty: number): RowStatus {
  if (receivedQty === orderedQty) return "matched";
  return receivedQty < orderedQty ? "short" : "over";
}

const ROW_BG: Record<RowStatus, string> = {
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

  const [rows, setRows] = useState<Record<string, RowState>>({});

  const items = invoice?.items ?? [];

  const getRow = (itemId: string, orderedQty: number, receivedQty: number | null): RowState =>
    rows[itemId] ?? { receivedQty: String(receivedQty ?? orderedQty), remark: "" };

  const setRow = (itemId: string, patch: Partial<RowState>, orderedQty: number, receivedQty: number | null) => {
    setRows((prev) => ({ ...prev, [itemId]: { ...getRow(itemId, orderedQty, receivedQty), ...patch } }));
  };

  const rowsWithStatus = items.map((item) => {
    const row = getRow(item.id, item.orderedQty, item.receivedQty);
    const receivedQty = Number(row.receivedQty || 0);
    return { item, row, receivedQty, status: getRowStatus(receivedQty, item.orderedQty) };
  });

  const totalProducts = rowsWithStatus.length;
  const matchedCount = rowsWithStatus.filter((r) => r.status === "matched").length;
  const shortCount = rowsWithStatus.filter((r) => r.status === "short").length;
  const overCount = rowsWithStatus.filter((r) => r.status === "over").length;
  const hasMismatch = shortCount > 0 || overCount > 0;

  const submit = async (mode: "draft" | "final") => {
    if (!invoice) return;
    const updated = await receiveCheck.mutateAsync({
      mode,
      items: rowsWithStatus.map(({ item, row, receivedQty }) => ({
        itemId: item.id,
        receivedQty,
        remark: row.remark || undefined,
      })),
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
            {rowsWithStatus.map(({ item, row, receivedQty, status }) => {
              const diff = receivedQty - item.orderedQty;
              return (
                <TableRow key={item.id} className={ROW_BG[status]}>
                  <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{item.productName}</TableCell>
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
                      onChange={(e) => setRow(item.id, { remark: e.target.value }, item.orderedQty, item.receivedQty)}
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
              <Button type="button" variant="brass" disabled={receiveCheck.isPending}>
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
          <Button type="button" variant="primary" disabled={receiveCheck.isPending} onClick={() => submit("final")}>
            ✓ গুডস রিসিপ্ট ভেরিফাই করুন
          </Button>
        )}
      </div>
    </>
  );
}
