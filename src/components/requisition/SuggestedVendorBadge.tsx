"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatBDT } from "@/utils/currency";
import { formatBnDate, toBnDigits } from "@/utils/date";
import type { RequisitionTopSuggestedVendor } from "@/types/requisition.types";

/** "সাজেস্টেড: {vendor}" badge beside a requisition item's product name —
 * whichever vendor it was most recently ordered from, or the cheapest
 * active vendor if it's never been ordered. Same Badge+Tooltip pattern as
 * PendingRequisitionBadge (this app's existing hover-detail convention),
 * requires an ancestor TooltipProvider (added once at RequisitionDashboard).
 * Reused as-is (via `plain`) for the "আরও দেখুন" expanded list of every
 * other vendor selling the product — same badge/tooltip design, just
 * without the "সাজেস্টেড:" prefix, since only one vendor is ever THE
 * suggested one. */
export function SuggestedVendorBadge({
  vendor,
  plain = false,
}: {
  vendor: RequisitionTopSuggestedVendor | null;
  plain?: boolean;
}) {
  if (!vendor) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="active" className="cursor-help">
          {plain ? vendor.vendorName : `সাজেস্টেড: ${vendor.vendorName}`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-56">
        <p className="mb-1.5 font-semibold text-ink">{vendor.vendorName}</p>
        <dl className="space-y-0.5 text-gray">
          <div>
            <dt className="inline">দাম: </dt>
            <dd className="inline font-mono text-ink">{formatBDT(vendor.price)}</dd>
          </div>
          <div>
            <dt className="inline">অর্ডার করা হয়েছে: </dt>
            <dd className="inline font-mono text-ink">{toBnDigits(vendor.orderCount)} বার</dd>
          </div>
          {vendor.lastOrderedAt && (
            <div>
              <dt className="inline">সর্বশেষ অর্ডার: </dt>
              <dd className="inline font-mono text-ink">{formatBnDate(vendor.lastOrderedAt)}</dd>
            </div>
          )}
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}
