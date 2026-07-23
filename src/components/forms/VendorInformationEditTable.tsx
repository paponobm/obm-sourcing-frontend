"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Plus, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StarRating } from "@/components/product/StarRating";
import { useRemoveVendorFromProduct, useSetVendorProductPrice, useVendors } from "@/hooks/useVendors";
import { formatBnDate } from "@/utils/date";
import type { ProductVendorEntry, UpdateProductVendorInput } from "@/types/product.types";

type RowState = { price: string; rating: number };

/** A single vendor's price/rating — purely controlled by the parent table's
 * state, no local state or save button of its own, so every row's edits are
 * captured by the single "Save Changes" action for the whole modal instead
 * of each row saving independently. The remove button is the one exception —
 * it acts immediately (its own confirmation dialog), since detaching a
 * vendor isn't something to stage alongside unrelated field edits. */
function VendorInformationRow({
  productId,
  vendor,
  row,
  onChange,
}: {
  productId: string;
  vendor: ProductVendorEntry;
  row: RowState;
  onChange: (patch: Partial<RowState>) => void;
}) {
  const removeVendorFromProduct = useRemoveVendorFromProduct();
  const isRemoving = removeVendorFromProduct.isPending && removeVendorFromProduct.variables?.vendorId === vendor.vendorId;

  return (
    <TableRow>
      <TableCell className="text-sm md:text-base">{vendor.vendorName}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={row.price}
          onChange={(e) => onChange({ price: e.target.value })}
          className="w-24 sm:w-28"
        />
      </TableCell>
      <TableCell>
        <StarRating value={row.rating} onChange={(rating) => onChange({ rating })} iconClassName="h-4 w-4" />
      </TableCell>
      <TableCell className="text-gray">{formatBnDate(vendor.lastUpdatedAt)}</TableCell>
      <TableCell>
        <ConfirmDialog
          trigger={
            <Button type="button" variant="ghost" size="sm" aria-label="ভেন্ডর বাদ দিন">
              <X className="h-3.5 w-3.5 text-red" />
            </Button>
          }
          title="ভেন্ডর বাদ দেবেন?"
          description={`"${vendor.vendorName}"-কে এই প্রোডাক্ট থেকে বাদ দেওয়া হবে। এটিই শেষ ভেন্ডর হলে প্রোডাক্টটি আবার পেন্ডিং অবস্থায় চলে যাবে।`}
          confirmLabel="বাদ দিন"
          onConfirm={() => removeVendorFromProduct.mutate({ vendorId: vendor.vendorId, productId })}
          isLoading={isRemoving}
        />
      </TableCell>
    </TableRow>
  );
}

/** Inline "add a new vendor to this product" row — a plain local form (not
 * react-hook-form, no field array), since it saves immediately and
 * independently through the same setVendorProductPrice mutation used by
 * every existing row. Backend sees no prior VendorProduct row for this
 * vendor+product pair, so it logs VENDOR_ADDED exactly as it already does
 * everywhere else this mutation is called from. */
function AddVendorRow({
  productId,
  existingVendorIds,
  onDone,
  onCancel,
}: {
  productId: string;
  existingVendorIds: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const { data: vendorsPage, isLoading: vendorsLoading } = useVendors({ page: 1, pageSize: 100 });
  const setVendorProductPrice = useSetVendorProductPrice();
  const [vendorId, setVendorId] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(5);

  const availableVendors = (vendorsPage?.data ?? []).filter((v) => !existingVendorIds.includes(v.id));
  const canSave = vendorId !== "" && Number(price) > 0;

  const handleAdd = async () => {
    if (!canSave) return;
    await setVendorProductPrice.mutateAsync({ vendorId, productId, price: Number(price), rating });
    onDone();
  };

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-md border border-dashed border-line p-2.5 sm:flex-row sm:items-center sm:gap-2.5 sm:p-3">
      <div className="sm:w-44 lg:w-48">
        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger>
            <SelectValue placeholder={vendorsLoading ? "লোড হচ্ছে..." : "ভেন্ডর নির্বাচন করুন"} />
          </SelectTrigger>
          <SelectContent>
            {availableVendors.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.shopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:w-28">
        <Input
          type="number"
          min={0}
          placeholder="দাম (৳)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1.5 sm:shrink-0">
        <span className="text-xs text-gray sm:hidden">রেটিং:</span>
        <StarRating value={rating} onChange={setRating} iconClassName="h-4 w-4" />
      </div>

      <div className="flex gap-1.5 sm:ml-auto sm:shrink-0">
        <Button
          type="button"
          variant="brass"
          size="sm"
          disabled={!canSave || setVendorProductPrice.isPending}
          onClick={handleAdd}
        >
          {setVendorProductPrice.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} aria-label="বাতিল">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export type VendorInformationEditTableHandle = {
  /** Only the rows whose price/rating actually differ from what was loaded —
   * called by the surrounding product form at submit time so its single
   * "Save Changes" action can send both the product's own fields and these
   * vendor rows together, in one request. */
  getDirtyVendors: () => UpdateProductVendorInput[];
};

/** The "ভেন্ডর তথ্য" (Vendor Information) section embedded in the Product
 * Edit modal, below the shared product-fields form — lets an admin change a
 * vendor's price/rating for this product without leaving the modal, or
 * remove that vendor from the product entirely (see VendorInformationRow's
 * own confirm-and-remove button). Price/rating row edits live here (not
 * per-row) so the parent form can pull every changed row at submit time via
 * `getDirtyVendors()` and save them alongside the product's own fields in a
 * single atomic request; removal acts immediately instead, since it isn't
 * something to stage. */
export const VendorInformationEditTable = forwardRef<VendorInformationEditTableHandle, {
  productId: string;
  vendors: ProductVendorEntry[];
}>(function VendorInformationEditTable({ productId, vendors }, ref) {
  const [addingVendor, setAddingVendor] = useState(false);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(vendors.map((v) => [v.vendorId, { price: String(v.price), rating: v.rating }])),
  );

  useImperativeHandle(
    ref,
    () => ({
      getDirtyVendors: () => {
        const dirty: UpdateProductVendorInput[] = [];
        for (const v of vendors) {
          const row = rows[v.vendorId];
          if (!row) continue;
          const priceChanged = Number(row.price) !== v.price;
          const ratingChanged = row.rating !== v.rating;
          if (priceChanged || ratingChanged) {
            dirty.push({ vendorId: v.vendorId, price: Number(row.price), rating: row.rating });
          }
        }
        return dirty;
      },
    }),
    [vendors, rows],
  );

  const updateRow = (vendorId: string, current: RowState, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [vendorId]: { ...(prev[vendorId] ?? current), ...patch } }));
  };

  return (
    <div>
      <h3 className="mb-2 font-serif text-sm text-teal-dark sm:text-base">ভেন্ডর তথ্য</h3>
      {vendors.length === 0 ? (
        <p className="text-xs text-gray sm:text-sm">এই প্রোডাক্টের জন্য এখনো কোনো ভেন্ডর যোগ করা হয়নি।</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ভেন্ডর</TableHead>
                <TableHead>দাম</TableHead>
                <TableHead>রেটিং</TableHead>
                <TableHead>সর্বশেষ আপডেট</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v) => {
                const defaultRow: RowState = { price: String(v.price), rating: v.rating };
                return (
                  <VendorInformationRow
                    key={v.vendorId}
                    productId={productId}
                    vendor={v}
                    row={rows[v.vendorId] ?? defaultRow}
                    onChange={(patch) => updateRow(v.vendorId, defaultRow, patch)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {addingVendor ? (
        <AddVendorRow
          productId={productId}
          existingVendorIds={vendors.map((v) => v.vendorId)}
          onDone={() => setAddingVendor(false)}
          onCancel={() => setAddingVendor(false)}
        />
      ) : (
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setAddingVendor(true)}>
          <Plus className="h-3.5 w-3.5" /> নতুন ভেন্ডর যোগ করুন
        </Button>
      )}
    </div>
  );
});
