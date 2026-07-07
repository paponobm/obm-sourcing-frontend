"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PriceCell } from "./PriceCell";
import { StarRating } from "./StarRating";
import type { ProductVendorEntry } from "@/types/product.types";

/** Inline vendor picker for a product row — selecting a vendor instantly shows their price + rating. */
export function ProductVendorPicker({ vendors }: { vendors: ProductVendorEntry[] }) {
  const [selectedId, setSelectedId] = useState(vendors[0]?.vendorId);
  const selected = vendors.find((v) => v.vendorId === selectedId) ?? vendors[0];

  if (!selected) {
    return <span className="text-xs text-gray">কোনো ভেন্ডর নেই</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select value={selected.vendorId} onValueChange={setSelectedId}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
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
    </div>
  );
}
