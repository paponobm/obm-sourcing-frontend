"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatBDT } from "@/utils/currency";
import { formatBnDate, toBnDigits } from "@/utils/date";
import type { VendorProductPrice } from "@/types/vendor.types";

/** Shows a small "পেন্ডিং (N)" badge with a details tooltip when a product has
 * open CONFIRMED requisitions (never Pending — not yet reviewed — or
 * Cancelled) — only ever rendered on the New Order page, where an admin
 * decides what to order. Deliberately absent from the Vendor Profile product
 * list, which stays a plain catalog. Each confirmed requisition gets its own
 * card in the tooltip since more than one can be open on the same product. */
export function PendingRequisitionBadge({ product }: { product: VendorProductPrice }) {
  const requisitions = product.confirmedRequisitions;
  if (requisitions.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="alert" className="cursor-help">
          পেন্ডিং ({toBnDigits(product.pendingRequisitionCount)})
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-64">
        <p className="mb-1.5 font-semibold text-ink">পেন্ডিং রিকুইজিশনের বিবরণ</p>
        <div className="space-y-1.5">
          {requisitions.map((r) => (
            <div key={r.requisitionId} className="rounded-md border border-line/70 p-2">
              <dl className="space-y-0.5 text-gray">
                <div>
                  <dt className="inline">রিকুইজিশন আইডি: </dt>
                  <dd className="inline font-mono text-ink">{r.requisitionCode}</dd>
                </div>
                <div>
                  <dt className="inline">অনুরোধকৃত পরিমাণ: </dt>
                  <dd className="inline text-ink">
                    {toBnDigits(r.requiredQty)} {product.unit}
                  </dd>
                </div>
                {/* <div>
                  <dt className="inline">প্রয়োজনীয় মূল্য: </dt>
                  <dd className="inline font-semibold text-brass">{formatBDT(r.requiredQty * product.price)}</dd>
                </div>
                <div>
                  <dt className="inline">তৈরির তারিখ: </dt>
                  <dd className="inline text-ink">{formatBnDate(r.createdAt)}</dd>
                </div>
                <div>
                  <dt className="inline">অনুরোধকারী: </dt>
                  <dd className="inline text-ink">{r.requestedByName}</dd>
                </div> */}
              </dl>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
