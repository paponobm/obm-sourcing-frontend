import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { formatBnDate } from "@/utils/date";
import {
  REQUISITION_PRIORITY_LABEL_BN,
  REQUISITION_STATUS_LABEL_BN,
  requisitionPriorityBadgeVariant,
} from "@/utils/status";
import type { PendingRequisition } from "@/types/requisition.types";

/** Vendor chips are derived at read time from the Product↔Vendor relationship
 * (every vendor currently supplying this product) — never chosen or stored on
 * the requisition itself. Each chip deep-links straight into that vendor's New
 * Order tab with this requisition's product + quantity pre-filled — clicking
 * it is the entire "convert to purchase order" action from the admin's
 * perspective. */
export function RequisitionCard({ requisition }: { requisition: PendingRequisition }) {
  const vendorLinkParams = new URLSearchParams({
    tab: "newOrder",
    requisitionId: requisition.id,
    productId: requisition.productId,
    qty: String(requisition.requiredQty),
  }).toString();

  return (
    <Card className="p-3.5 sm:p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="font-serif text-sm text-teal-dark sm:text-base lg:text-lg">{requisition.productName}</div>
        <Badge variant={requisitionPriorityBadgeVariant(requisition.priority)}>
          {REQUISITION_PRIORITY_LABEL_BN[requisition.priority]}
        </Badge>
      </div>

      <div className="space-y-1 text-xs text-gray sm:text-sm">
        <div className="flex justify-between gap-2">
          <span>প্রয়োজনীয় পরিমাণ</span>
          <span className="font-semibold text-ink">
            {requisition.requiredQty} {requisition.unit}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>অনুরোধ করেছেন</span>
          <span className="font-semibold text-ink">{requisition.requestedByName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>তৈরির তারিখ</span>
          <span className="font-semibold text-ink">{formatBnDate(requisition.createdAt)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>স্ট্যাটাস</span>
          <Badge variant="low">{REQUISITION_STATUS_LABEL_BN[requisition.status]}</Badge>
        </div>
      </div>

      <div className="mt-3 border-t border-line pt-2.5">
        <div className="mb-1.5 text-[11px] font-semibold text-gray sm:text-xs">সরবরাহকারী</div>
        {requisition.suggestedVendors.length === 0 ? (
          <span className="text-xs text-gray">এই প্রোডাক্টের কোনো ভেন্ডর সেট করা নেই</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {requisition.suggestedVendors.map((v) => (
              <Link
                key={v.vendorId}
                href={`${ROUTES.vendorDetail(v.vendorId)}?${vendorLinkParams}`}
                className="rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-teal-dark transition-colors hover:bg-line sm:text-xs"
              >
                {v.vendorName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
