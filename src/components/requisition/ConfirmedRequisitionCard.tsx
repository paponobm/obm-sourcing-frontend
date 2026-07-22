"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestedVendorBadge } from "@/components/requisition/SuggestedVendorBadge";
import { AdditionalSuppliers } from "@/components/requisition/AdditionalSuppliers";
import { useHasRole } from "@/hooks/useHasRole";
import { ROUTES } from "@/constants/routes";
import { formatBnDate, toBnDigits } from "@/utils/date";
import { REQUISITION_PRIORITY_LABEL_BN, requisitionPriorityBadgeVariant } from "@/utils/status";
import type { Requisition, RequisitionSuggestedVendor } from "@/types/requisition.types";

/** Every vendor selling at least one of this requisition's still-unfulfilled
 * items, de-duplicated — each chip is "Create Order" itself, deep-linking
 * into that vendor's New Order tab (OrderCreatePanel prefills only the
 * items that vendor actually sells, via useRequisitionVendorItems). */
function remainingVendors(requisition: Requisition): RequisitionSuggestedVendor[] {
  const byId = new Map<string, RequisitionSuggestedVendor>();
  for (const item of requisition.items) {
    if (item.fulfilled) continue;
    for (const v of item.suggestedVendors) byId.set(v.vendorId, v);
  }
  return [...byId.values()];
}

export function ConfirmedRequisitionCard({
  requisition,
  onViewDetails,
}: {
  requisition: Requisition;
  onViewDetails: () => void;
}) {
  const totalQty = requisition.items.reduce((sum, i) => sum + i.requiredQty, 0);
  const isManager = useHasRole(["MANAGER"]);
  const canPlaceOrder = !isManager;
  const vendors = remainingVendors(requisition);

  return (
    <Card className="p-3.5 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-teal-dark sm:text-base">
              {requisition.requisitionCode}
            </span>
            <Badge variant={requisitionPriorityBadgeVariant(requisition.priority)}>
              {REQUISITION_PRIORITY_LABEL_BN[requisition.priority]}
            </Badge>
          </div>
          <div className="mt-1 text-[11px] text-gray sm:text-xs">
            কনফার্ম করেছেন: {requisition.confirmedByName} · {requisition.confirmedAt ? formatBnDate(requisition.confirmedAt) : ""}
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onViewDetails}>
          <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> বিস্তারিত দেখুন
        </Button>
      </div>

      <div className="mt-2.5 space-y-1">
        {requisition.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className=" flex flex-wrap items-center gap-1.5 text-ink">
              {item.productName} — {toBnDigits(item.requiredQty)} {item.unit}
              {!isManager && (
                <>
                  <SuggestedVendorBadge vendor={item.suggestedVendor} />
                  <AdditionalSuppliers item={item} />
                </>
              )}
            </span>
            {!isManager && (
              <Badge variant={item.fulfilled ? "active" : "low"}>
                {item.fulfilled ? "অর্ডার করা হয়েছে" : "বাকি আছে"}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {canPlaceOrder && (
        <div className="mt-3 border-t border-line pt-2.5">
          <div className="mb-1.5 text-[11px] font-semibold text-gray sm:text-xs">অর্ডার তৈরি করুন — ভেন্ডর নির্বাচন করুন</div>
          {vendors.length === 0 ? (
            <span className="text-xs text-gray">
              {totalQty > 0 && requisition.items.every((i) => i.fulfilled)
                ? "সব প্রোডাক্ট অর্ডার করা হয়েছে"
                : "বাকি প্রোডাক্টগুলোর কোনো ভেন্ডর সেট করা নেই"}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {vendors.map((v) => (
                <Link
                  key={v.vendorId}
                  href={`${ROUTES.vendorDetail(v.vendorId)}?tab=newOrder&requisitionId=${requisition.id}`}
                  className="rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-teal-dark transition-colors hover:bg-line sm:text-xs"
                >
                  {v.vendorName}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
