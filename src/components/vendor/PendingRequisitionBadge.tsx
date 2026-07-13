"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatBnDate } from "@/utils/date";
import type { VendorProductPrice } from "@/types/vendor.types";

/** Shows a small "পেন্ডিং (N)" badge with a details tooltip when a product has
 * open requisitions — only ever rendered on the New Order page, where an
 * admin decides what to order. Deliberately absent from the Vendor Profile
 * product list, which stays a plain catalog. */
export function PendingRequisitionBadge({ product }: { product: VendorProductPrice }) {
  const summary = product.pendingRequisitionSummary;
  if (!summary) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="alert" className="cursor-help">
          পেন্ডিং ({product.pendingRequisitionCount})
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-56">
        <p className="mb-1.5 font-semibold text-ink">পেন্ডিং রিকুইজিশনের বিবরণ</p>
        <dl className="space-y-0.5 text-gray">
          <div>
            <dt className="inline">পেন্ডিং পরিমাণ: </dt>
            <dd className="inline text-ink">
              {summary.totalQty} {product.unit}
            </dd>
          </div>
          {product.pendingRequisitionCount > 1 && (
            <div>
              <dt className="inline">ওপেন রিকুইজিশন: </dt>
              <dd className="inline text-ink">{product.pendingRequisitionCount}</dd>
            </div>
          )}
          <div>
            <dt className="inline">সর্বশেষ রিকুইজিশন: </dt>
            <dd className="inline text-ink">{formatBnDate(summary.latestDate)}</dd>
          </div>
          <div>
            <dt className="inline">অনুরোধকারী: </dt>
            <dd className="inline text-ink">{summary.latestRequestedByName}</dd>
          </div>
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}
