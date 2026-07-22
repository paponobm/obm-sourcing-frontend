"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { StarRating } from "./StarRating";
import { formatBDT } from "@/utils/currency";
import { formatBnDate, toBnDigits } from "@/utils/date";
import type { ProductVendorEntry } from "@/types/product.types";

/** Inline vendor viewer for a product row — always shows the vendor this
 * product was most recently ordered from, or (if it's never been ordered)
 * the cheapest vendor. This is fully computed from `recommendedVendorId`
 * (order history / lowest price, resolved server-side) on every render —
 * there is no locally-remembered or persisted "preferred vendor" override,
 * so the row always reflects the latest data with no manual refresh needed.
 * The dropdown itself is just a way to browse every vendor's price/rating/
 * order-history via hover; it doesn't change what's selected by default. */
export function ProductVendorPicker({
  recommendedVendorId,
  lowestPrice,
  highestPrice,
  vendors,
}: {
  recommendedVendorId?: string | null;
  lowestPrice: number;
  highestPrice: number;
  vendors: ProductVendorEntry[];
}) {
  const selected = vendors.find((v) => v.vendorId === recommendedVendorId) ?? vendors[0];

  if (!selected) {
    return <span className="text-xs text-gray">কোনো ভেন্ডর নেই</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-3">
        <Select value={selected.vendorId}>
          <SelectTrigger className="h-7 w-[120px] text-[11px] sm:h-8 sm:w-[150px] sm:text-xs lg:h-9 lg:w-[170px] lg:text-sm">
            <SelectValue>{selected.vendorName}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {vendors.map((v) => (
              <SelectItem key={v.vendorId} value={v.vendorId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex w-full items-center justify-between gap-2">
                      <span>{v.vendorName}</span>
                      <span className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brass">
                        {formatBDT(v.price)}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray">ভেন্ডর রেটিং:</span>
                        <StarRating value={v.rating} iconClassName="h-3 w-3" />
                      </div>
                      <div>
                        <span className="text-gray">মোট অর্ডার: </span>
                        <span className="font-mono">{toBnDigits(v.totalOrderCount)}</span> টি
                      </div>
                      <div>
                        <span className="text-gray">সর্বশেষ অর্ডার: </span>
                        {v.lastOrderedDate ? formatBnDate(v.lastOrderedDate) : "কখনো অর্ডার করা হয়নি"}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-mono text-xs font-bold text-brass sm:text-sm lg:text-base">
          {formatBDT(lowestPrice)} – {formatBDT(highestPrice)}
        </span>
      </div>
    </TooltipProvider>
  );
}
