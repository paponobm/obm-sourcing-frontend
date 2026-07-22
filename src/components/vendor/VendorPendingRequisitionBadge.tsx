"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toBnDigits } from "@/utils/date";
import type { VendorPendingRequisitionItem } from "@/types/vendor.types";

/** Shows a small "পেন্ডিং (N)" badge beside a vendor's name on the Vendor
 * List, with a hover tooltip naming every one of that vendor's own products
 * that currently has an open requisition — mirrors PendingRequisitionBadge's
 * exact styling (same `alert` badge variant), but scoped to a vendor's whole
 * product line instead of a single product. Absent entirely when the vendor
 * has no pending requisitions. */
export function VendorPendingRequisitionBadge({ items }: { items: VendorPendingRequisitionItem[] }) {
  if (items.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="alert" className="ml-1.5 cursor-help font-mono bg-brass text-white">
          পেন্ডিং ({toBnDigits(items.length)})
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-64">
        <p className="mb-1.5 font-semibold text-ink">পেন্ডিং রিকুইজিশন</p>
        <ul className="space-y-0.5 text-gray">
          {items.map((item) => (
            <li key={item.productId}>
              • <span className="text-ink">{item.productName}</span> —{" "}
              <span className="font-mono">{toBnDigits(item.totalQty)}</span> {item.unit}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
