"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StarRating } from "@/components/product/StarRating";
import { useSetVendorProductPrice } from "@/hooks/useVendors";
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
    </div>
  );
}
