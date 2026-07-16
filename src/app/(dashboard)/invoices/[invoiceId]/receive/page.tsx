"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Check, X } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useInvoice, useReceiveCheck } from "@/hooks/useInvoices";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type RowState = { receivedQty: string; remark: string };

export default function ReceiveCheckPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const receiveCheck = useReceiveCheck(invoiceId);

  const [rows, setRows] = useState<Record<string, RowState>>({});

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

  const submit = async (mode: "draft" | "final") => {
    if (!invoice) return;
    await receiveCheck.mutateAsync({
      mode,
      items: items.map((it) => {
        const row = getRow(it.id, it.orderedQty, it.receivedQty);
        return { itemId: it.id, receivedQty: Number(row.receivedQty || 0), remark: row.remark || undefined };
      }),
      courierId: invoice.courierId,
      laborCost: invoice.laborCost,
      courierCost: invoice.courierCost,
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

      <Card>
        <CardHeader>
          <CardTitle>অর্ডার করা Qty বনাম রিসিভ করা Qty মিলিয়ে দেখুন</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>রিসিভড QTY</TableHead>
              <TableHead>মিল</TableHead>
              <TableHead>মন্তব্য</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const row = getRow(item.id, item.orderedQty, item.receivedQty);
              const receivedQty = Number(row.receivedQty || 0);
              const diff = receivedQty - item.orderedQty;
              const matched = diff === 0;

              return (
                <TableRow key={item.id} className={cn(matched ? "bg-green-soft" : "bg-[#f6e5e2]")}>
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
