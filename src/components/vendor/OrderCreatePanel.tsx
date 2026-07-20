"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Pencil, Ban, CheckCircle2, History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PendingRequisitionBadge } from "@/components/vendor/PendingRequisitionBadge";
import { ProductActivityLogModal } from "@/components/product/ProductActivityLogModal";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useSetVendorProductPrice } from "@/hooks/useVendors";
import { useActivateProduct, useDeactivateProduct } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/use-debounce";
import { formatBDT } from "@/utils/currency";
import type { VendorProductPrice, VendorWithProducts } from "@/types/vendor.types";

type RowState = { selected: boolean; qty: string; requisitionItemId?: string };
type StatusFilter = "active" | "inactive" | "all";
export type PrefillItem = { productId: string; qty: number; requisitionItemId: string };

/** The "প্রোডাক্ট বাছাই করুন..." order-creation picker — shared by the standalone /orders/new page and the vendor profile tab. */
export function OrderCreatePanel({
  vendor,
  onCreated,
  onCancel,
  prefillItems,
}: {
  vendor: VendorWithProducts;
  onCreated: (invoiceId: string) => void;
  onCancel?: () => void;
  /** Pre-selects and pre-fills one or more rows (e.g. arriving from a
   * Confirmed requisition's vendor chip, one per still-unordered item that
   * vendor sells) — the admin still reviews/edits qty before confirming. */
  prefillItems?: PrefillItem[];
}) {
  const createInvoice = useCreateInvoice(vendor.id);
  const setVendorProductPrice = useSetVendorProductPrice();
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();

  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    (prefillItems ?? []).reduce<Record<string, RowState>>((acc, item) => {
      acc[item.productId] = { selected: true, qty: String(item.qty), requisitionItemId: item.requisitionItemId };
      return acc;
    }, {}),
  );

  // `prefillItems` (from a requisition's vendor-fulfillable-items query) can
  // still be loading on first render, arriving only after this component has
  // already mounted with empty rows — the lazy useState initializer above
  // only ever runs once, so it alone would miss items that show up late.
  // The `!prev[...]` guard makes this idempotent against re-renders/refetches
  // without ever clobbering a row the admin already unchecked or edited.
  useEffect(() => {
    if (!prefillItems || prefillItems.length === 0) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const item of prefillItems) {
        if (!next[item.productId]) {
          next[item.productId] = { selected: true, qty: String(item.qty), requisitionItemId: item.requisitionItemId };
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillItems]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [historyProduct, setHistoryProduct] = useState<{ id: string; name: string } | null>(null);

  // Only ACTIVE products (this vendor's own cascade, or manually deactivated
  // excludes the rest) can ever be ordered — used for totals/submission
  // regardless of what the search/status filter below is currently showing.
  const orderableProducts = vendor.products.filter((p) => p.productStatus === "ACTIVE");

  const displayedProducts = vendor.products
    .filter((p) => (statusFilter === "all" ? true : p.productStatus === statusFilter.toUpperCase()))
    .filter((p) => {
      const term = debouncedSearch.trim().toLowerCase();
      if (!term) return true;
      return p.productName.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    });

  const getRow = (productId: string): RowState => rows[productId] ?? { selected: false, qty: "" };

  const setRow = (productId: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [productId]: { ...getRow(productId), ...patch } }));
  };

  const getPriceDraft = (p: VendorProductPrice): string => priceEdits[p.productId] ?? String(p.price);

  const selectedRows = orderableProducts
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
        requisitionItemId: row.requisitionItemId,
      })),
    });
    setRows({});
    onCreated(invoice.id);
  };

  const handleConfirmPriceUpdate = (p: VendorProductPrice) => {
    const draft = getPriceDraft(p);
    setVendorProductPrice.mutate(
      { vendorId: vendor.id, productId: p.productId, price: Number(draft), rating: p.rating },
      {
        onSuccess: () => {
          setPriceEdits((prev) => {
            const next = { ...prev };
            delete next[p.productId];
            return next;
          });
        },
      },
    );
  };

  if (vendor.products.length === 0) {
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
        <CardHeader className="flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>প্রোডাক্ট বাছাই করুন এই ভেন্ডরের লিস্ট থেকে</CardTitle>
            <CardTag>
              {displayedProducts.length} টির মধ্যে {totalItems} টি সিলেক্টেড
            </CardTag>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBox value={search} onChange={setSearch} placeholder="প্রোডাক্টের নাম বা SKU দিয়ে সার্চ করুন..." />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">অ্যাক্টিভ প্রোডাক্ট</SelectItem>
                <SelectItem value="inactive">ইনঅ্যাক্টিভ প্রোডাক্ট</SelectItem>
                <SelectItem value="all">সব প্রোডাক্ট</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {displayedProducts.length === 0 ? (
          <EmptyState title="কোনো প্রোডাক্ট পাওয়া যায়নি" description="অন্য কিছু সার্চ করুন অথবা ফিল্টার পরিবর্তন করুন।" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>প্রোডাক্ট</TableHead>
                <TableHead>ইউনিট</TableHead>
                <TableHead>ভেন্ডর প্রাইস (প্রতি পিস)</TableHead>
                <TableHead>অর্ডার QTY</TableHead>
                <TableHead>লাইন টোটাল</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.map((p) => {
                const row = getRow(p.productId);
                const qty = Number(row.qty || 0);
                const canOrder = p.productStatus === "ACTIVE";
                const priceDraft = getPriceDraft(p);
                const priceChanged = priceDraft !== "" && Number(priceDraft) >= 0 && Number(priceDraft) !== p.price;
                return (
                  <TableRow key={p.productId}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-teal"
                        checked={row.selected}
                        disabled={!canOrder}
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
                    <TableCell className="text-gray">{p.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={priceDraft}
                          onChange={(e) =>
                            setPriceEdits((prev) => ({ ...prev, [p.productId]: e.target.value }))
                          }
                          className="w-24 font-mono text-brass sm:w-28"
                        />
                        <ConfirmDialog
                          trigger={
                            <Button type="button" variant="ghost" size="sm" disabled={!priceChanged}>
                              <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                            </Button>
                          }
                          title="দাম আপডেট করুন"
                          description="আপনি কি নিশ্চিত এই ভেন্ডরের প্রোডাক্টের দাম আপডেট করতে চান?"
                          confirmLabel="নিশ্চিত করুন"
                          onConfirm={() => handleConfirmPriceUpdate(p)}
                          isLoading={setVendorProductPrice.isPending}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        disabled={!row.selected || !canOrder}
                        value={row.qty}
                        onChange={(e) => setRow(p.productId, { qty: e.target.value })}
                        className="w-20 sm:w-24"
                      />
                    </TableCell>
                    <TableCell className="font-mono font-bold text-brass">
                      {row.selected && canOrder && qty > 0 ? formatBDT(p.price * qty) : "–"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryProduct({ id: p.productId, name: p.productName })}
                        >
                          <History className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        {canOrder ? (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="প্রোডাক্টটি নিষ্ক্রিয় করবেন?"
                            description="এই প্রোডাক্টটি নতুন অর্ডারের জন্য অনুপলব্ধ হয়ে যাবে। বিদ্যমান অর্ডার হিস্ট্রি অপরিবর্তিত থাকবে।"
                            confirmLabel="নিষ্ক্রিয় করুন"
                            onConfirm={() => deactivateProduct.mutate(p.productId)}
                            isLoading={deactivateProduct.isPending}
                          />
                        ) : (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="প্রোডাক্টটি সক্রিয় করবেন?"
                            description={`আপনি কি নিশ্চিত "${p.productName}" সক্রিয় করতে চান?`}
                            confirmLabel="সক্রিয় করুন"
                            onConfirm={() => activateProduct.mutate(p.productId)}
                            isLoading={activateProduct.isPending}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
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
          <span className="font-mono text-base font-bold text-brass sm:text-lg">{formatBDT(grandTotal)}</span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2 rounded-md bg-brass-soft px-3 py-2.5 text-xs text-brass sm:mt-4 sm:text-sm">
        <Lightbulb className="h-4 w-4 shrink-0" />
        <p className="m-0">
          দাম অটোম্যাটিক ভেন্ডরের সর্বশেষ সংরক্ষিত দাম থেকে বসে যায়। প্রয়োজনে দাম পরিবর্তন করে পেন্সিল আইকনে ক্লিক করুন —
          নিশ্চিত করলেই নতুন দাম সংরক্ষণ হবে। শুধু Quantity বসিয়ে অর্ডার করতে চাইলে দাম পরিবর্তনের প্রয়োজন নেই।
        </p>
      </div>

      <div className="mt-4 flex gap-2 sm:mt-5">
        <Button
          type="button"
          variant="brass"
          disabled={selectedRows.length === 0 || createInvoice.isPending}
          onClick={handleSubmit}
        >
          {createInvoice.isPending ? "তৈরি হচ্ছে..." : "✓ Order তৈরি করুন"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            বাতিল
          </Button>
        )}
      </div>

      <ProductActivityLogModal
        productId={historyProduct?.id ?? null}
        productName={historyProduct?.name ?? ""}
        onOpenChange={(open) => !open && setHistoryProduct(null)}
      />
    </TooltipProvider>
  );
}
