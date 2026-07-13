"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { PendingRequisitionBadge } from "@/components/vendor/PendingRequisitionBadge";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { formatBDT } from "@/utils/currency";
import type { VendorWithProducts } from "@/types/vendor.types";

type RowState = { selected: boolean; qty: string };

/** The "প্রোডাক্ট বাছাই করুন..." order-creation picker — shared by the standalone /orders/new page and the vendor profile tab. */
export function OrderCreatePanel({
  vendor,
  onCreated,
  onCancel,
  prefillProductId,
  prefillQty,
}: {
  vendor: VendorWithProducts;
  onCreated: (invoiceId: string) => void;
  onCancel?: () => void;
  /** Pre-selects and pre-fills one row (e.g. arriving from a Requisition's
   * suggested-vendor chip) — the admin still reviews/edits qty before confirming. */
  prefillProductId?: string;
  prefillQty?: string;
}) {
  const createInvoice = useCreateInvoice(vendor.id);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    prefillProductId ? { [prefillProductId]: { selected: true, qty: prefillQty ?? "1" } } : {},
  );

  const products = vendor.products;

  const getRow = (productId: string): RowState => rows[productId] ?? { selected: false, qty: "" };

  const setRow = (productId: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [productId]: { ...getRow(productId), ...patch } }));
  };

  const selectedRows = products
    .map((p) => ({ product: p, row: getRow(p.productId) }))
    .filter(({ row }) => row.selected && Number(row.qty) > 0);

  const totalItems = selectedRows.length;
  const totalPieces = selectedRows.reduce((sum, { row }) => sum + Number(row.qty || 0), 0);
  const grandTotal = selectedRows.reduce(
    (sum, { product, row }) => sum + product.price * Number(row.qty || 0),
    0,
  );

  const handleSubmit = async () => {
    if (selectedRows.length === 0) return;
    const invoice = await createInvoice.mutateAsync({
      items: selectedRows.map(({ product, row }) => ({
        productId: product.productId,
        orderedQty: Number(row.qty),
      })),
    });
    setRows({});
    onCreated(invoice.id);
  };

  if (products.length === 0) {
    return (
      <EmptyState
        title="এই ভেন্ডরের কোনো প্রোডাক্ট নেই"
        description="অর্ডার তৈরি করতে হলে আগে এই ভেন্ডরের জন্য প্রোডাক্টের দাম সেট করতে হবে।"
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader>
          <CardTitle>প্রোডাক্ট বাছাই করুন এই ভেন্ডরের লিস্ট থেকে</CardTitle>
          <CardTag>
            {products.length} টির মধ্যে {totalItems} টি সিলেক্টেড
          </CardTag>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>ভেন্ডর প্রাইস (প্রতি পিস)</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>লাইন টোটাল</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const row = getRow(p.productId);
              const qty = Number(row.qty || 0);
              return (
                <TableRow key={p.productId}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-teal"
                      checked={row.selected}
                      onChange={(e) =>
                        setRow(p.productId, {
                          selected: e.target.checked,
                          qty: e.target.checked && !row.qty ? "1" : row.qty,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {p.productName}
                      <PendingRequisitionBadge product={p} />
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input value={formatBDT(p.price)} disabled className="w-24 sm:w-28" />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      disabled={!row.selected}
                      value={row.qty}
                      onChange={(e) => setRow(p.productId, { qty: e.target.value })}
                      className="w-20 sm:w-24"
                    />
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    {row.selected && qty > 0 ? formatBDT(p.price * qty) : "–"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3.5 flex flex-col items-end gap-1 text-xs sm:mt-4 sm:text-sm">
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট আইটেম</span>
          <span className="font-semibold">{totalItems} টি প্রোডাক্ট</span>
        </div>
        <div className="flex w-full max-w-xs justify-between sm:max-w-sm">
          <span className="text-gray">মোট পিস</span>
          <span className="font-semibold">{totalPieces} পিস</span>
        </div>
        <div className="flex w-full max-w-xs justify-between border-t border-line pt-1.5 sm:max-w-sm">
          <span className="font-serif text-sm text-teal-dark sm:text-base">সর্বমোট</span>
          <span className="font-mono text-base font-bold text-teal-dark sm:text-lg">{formatBDT(grandTotal)}</span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2 rounded-md bg-brass-soft px-3 py-2.5 text-xs text-brass sm:mt-4 sm:text-sm">
        <Lightbulb className="h-4 w-4 shrink-0" />
        <p className="m-0">
          দাম অটোম্যাটিক ভেন্ডরের সর্বশেষ সংরক্ষিত দাম থেকে বসে যায় (এডিট করা যাবে না — যদি দাম পরিবর্তন হয়, ভেন্ডর
          প্রোফাইলে গিয়ে আগে দাম আপডেট করবেন)। শুধু Quantity বসাতে হবে।
        </p>
      </div>

      <div className="mt-4 flex gap-2 sm:mt-5">
        <Button
          type="button"
          variant="brass"
          disabled={selectedRows.length === 0 || createInvoice.isPending}
          onClick={handleSubmit}
        >
          {createInvoice.isPending ? "তৈরি হচ্ছে..." : "✓ অর্ডার কনফার্ম করুন — ইনভয়েস তৈরি হবে"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            বাতিল
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
