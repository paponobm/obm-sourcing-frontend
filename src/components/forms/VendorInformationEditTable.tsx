"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StarRating } from "@/components/product/StarRating";
import { useSetVendorProductPrice, useVendors } from "@/hooks/useVendors";
import { formatBnDate } from "@/utils/date";
import { VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import type { ProductVendorEntry } from "@/types/product.types";
import type { VendorStatus } from "@/types/common.types";

/** One row's price/rating/status are edited independently, in local state,
 * and saved with their own button — never tied to the surrounding product
 * form's own submit, so editing a vendor row can't accidentally submit (or
 * be blocked by) the product-fields form around it. */
function VendorInformationRow({ productId, vendor }: { productId: string; vendor: ProductVendorEntry }) {
  const setVendorProductPrice = useSetVendorProductPrice();
  const [price, setPrice] = useState(String(vendor.price));
  const [rating, setRating] = useState(vendor.rating);
  const [status, setStatus] = useState<VendorStatus>(vendor.status);

  const dirty = price !== String(vendor.price) || rating !== vendor.rating || status !== vendor.status;

  const handleSave = async () => {
    await setVendorProductPrice.mutateAsync({
      vendorId: vendor.vendorId,
      productId,
      price: Number(price),
      rating,
      status: status !== vendor.status ? status : undefined,
    });
  };

  return (
    <TableRow>
      <TableCell className="text-sm md:text-base">{vendor.vendorName}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 sm:w-28"
        />
      </TableCell>
      <TableCell>
        <StarRating value={rating} onChange={setRating} iconClassName="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Select value={status} onValueChange={(v) => setStatus(v as VendorStatus)}>
          <SelectTrigger className="w-28 sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">{VENDOR_STATUS_LABEL_BN.ACTIVE}</SelectItem>
            <SelectItem value="INACTIVE">{VENDOR_STATUS_LABEL_BN.INACTIVE}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-gray">{formatBnDate(vendor.lastUpdatedAt)}</TableCell>
      <TableCell>
        <Button
          type="button"
          variant="brass"
          size="sm"
          disabled={!dirty || setVendorProductPrice.isPending}
          onClick={handleSave}
        >
          {setVendorProductPrice.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </Button>
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

/** The "ভেন্ডর তথ্য" (Vendor Information) section embedded in the Product
 * Edit modal, below the shared product-fields form — lets an admin change a
 * vendor's price/rating/global-status for this product without leaving the
 * modal. Each vendor row saves independently via the same setVendorProductPrice
 * mutation already used by the vendor's own page, so both surfaces (and the
 * product list's embedded vendor column) refresh automatically on success. */
export function VendorInformationEditTable({
  productId,
  vendors,
}: {
  productId: string;
  vendors: ProductVendorEntry[];
}) {
  const [addingVendor, setAddingVendor] = useState(false);

  return (
    <div>
      <h3 className="mb-2 font-serif text-sm text-teal-dark sm:text-base">ভেন্ডর তথ্য</h3>
      {vendors.length === 0 ? (
        <p className="text-xs text-gray sm:text-sm">এই প্রোডাক্টের জন্য এখনো কোনো ভেন্ডর যোগ করা হয়নি।</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ভেন্ডর</TableHead>
                <TableHead>দাম</TableHead>
                <TableHead>রেটিং</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>সর্বশেষ আপডেট</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v) => (
                <VendorInformationRow key={v.vendorId} productId={productId} vendor={v} />
              ))}
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
}
