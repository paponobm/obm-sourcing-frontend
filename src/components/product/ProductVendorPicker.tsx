"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSetPreferredVendor } from "@/hooks/useProducts";
import { PriceCell } from "./PriceCell";
import { StarRating } from "./StarRating";
import type { ProductVendorEntry } from "@/types/product.types";

/** Inline vendor picker for a product row — selecting a vendor instantly shows
 * their price + rating, but only actually persists as the product's preferred
 * ("Best") vendor after the admin confirms the change. */
export function ProductVendorPicker({
  productId,
  preferredVendorId,
  vendors,
}: {
  productId: string;
  preferredVendorId?: string | null;
  vendors: ProductVendorEntry[];
}) {
  const setPreferredVendor = useSetPreferredVendor();
  const [selectedId, setSelectedId] = useState(preferredVendorId ?? vendors[0]?.vendorId);
  const [pendingVendorId, setPendingVendorId] = useState<string | null>(null);

  const selected = vendors.find((v) => v.vendorId === selectedId) ?? vendors[0];
  const pendingVendor = vendors.find((v) => v.vendorId === pendingVendorId);

  if (!selected) {
    return <span className="text-xs text-gray">কোনো ভেন্ডর নেই</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-3">
      <Select value={selected.vendorId} onValueChange={(vendorId) => setPendingVendorId(vendorId)}>
        <SelectTrigger className="h-7 w-[120px] text-[11px] sm:h-8 sm:w-[150px] sm:text-xs lg:h-9 lg:w-[170px] lg:text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {vendors.map((v) => (
            <SelectItem key={v.vendorId} value={v.vendorId}>
              {v.vendorName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <PriceCell amount={selected.price} lowest={selected.vendorId === vendors[0]?.vendorId} />
      <StarRating value={selected.rating} />

      {/* Hidden trigger — ConfirmDialog opens programmatically via `open` below,
          not by user click, since the Select itself is what starts this flow. */}
      <ConfirmDialog
        trigger={<span className="hidden" />}
        title="প্রেফার্ড ভেন্ডর পরিবর্তন করবেন?"
        description={
          pendingVendor ? `আপনি কি নিশ্চিত "${pendingVendor.vendorName}"-কে প্রেফার্ড (সেরা) ভেন্ডর হিসেবে নির্ধারণ করতে চান?` : undefined
        }
        confirmLabel="নিশ্চিত করুন"
        open={pendingVendorId !== null}
        onOpenChange={(open) => !open && setPendingVendorId(null)}
        onConfirm={() => {
          if (!pendingVendorId) return;
          setPreferredVendor.mutate(
            { id: productId, vendorId: pendingVendorId },
            { onSuccess: () => setSelectedId(pendingVendorId) },
          );
          setPendingVendorId(null);
        }}
        isLoading={setPreferredVendor.isPending}
      />
    </div>
  );
}
