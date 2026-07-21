"use client";

import { Pencil, Ban, CheckCircle2, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CancelRequisitionDialog } from "@/components/requisition/CancelRequisitionDialog";
import { SuggestedVendorBadge } from "@/components/requisition/SuggestedVendorBadge";
import { useConfirmRequisition, useCancelRequisition } from "@/hooks/useRequisitions";
import { useHasRole } from "@/hooks/useHasRole";
import { formatBnDate, toBnDigits } from "@/utils/date";
import {
  REQUISITION_PRIORITY_LABEL_BN,
  REQUISITION_STATUS_LABEL_BN,
  requisitionPriorityBadgeVariant,
} from "@/utils/status";
import type { Requisition } from "@/types/requisition.types";

/** Pending Requisitions' horizontal row card — one requisition per row, its
 * item list summarized (not shown in full — see RequisitionDetailModal for
 * that). Only View Details / Confirm / Cancel here; vendor selection only
 * becomes available once Confirmed (ConfirmedRequisitionCard). */
export function RequisitionCard({
  requisition,
  onViewDetails,
  onEdit,
}: {
  requisition: Requisition;
  onViewDetails: () => void;
  onEdit: () => void;
}) {
  const confirmRequisition = useConfirmRequisition();
  const cancelRequisition = useCancelRequisition();
  const canConfirm = !useHasRole(["MANAGER"]);
  const totalQty = requisition.items.reduce((sum, i) => sum + i.requiredQty, 0);

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
          <div className="mt-1 text-[11px] text-brass sm:text-xs">
            {formatBnDate(requisition.createdAt)} · অনুরোধ করেছেন: {requisition.requestedByName}
          </div>
        </div>
        <Badge variant="low">{REQUISITION_STATUS_LABEL_BN[requisition.status]}</Badge>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray sm:text-sm">
        <span>
          মোট প্রোডাক্ট: <strong className="text-ink">{toBnDigits(requisition.items.length)}</strong>
        </span>
        <span>
          মোট পরিমাণ: <strong className="text-ink">{toBnDigits(totalQty)}</strong>
        </span>
      </div>

      <div className="mt-2.5 space-y-1">
        {requisition.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="text-ink">
              {item.productName} — {toBnDigits(item.requiredQty)} {item.unit}
            </span>
            {/* <SuggestedVendorBadge vendor={item.suggestedVendor} /> */}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
        <Button type="button" variant="ghost" size="sm" onClick={onViewDetails}>
          <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> বিস্তারিত দেখুন
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> এডিট
        </Button>
        {canConfirm && (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="ghost" size="sm">
                <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5" /> কনফার্ম
              </Button>
            }
            title="রিকুইজিশন কনফার্ম করবেন?"
            description="আপনি কি নিশ্চিত এই রিকুইজিশনটি কনফার্ম করতে চান? কনফার্ম করার পর এটি কনফার্মড রিকুইজিশন সেকশনে চলে যাবে এবং অর্ডার তৈরির জন্য উপলব্ধ হবে।"
            confirmLabel="কনফার্ম করুন"
            onConfirm={() => confirmRequisition.mutate(requisition.id)}
            isLoading={confirmRequisition.isPending}
          />
        )}
        <CancelRequisitionDialog
          trigger={
            <Button type="button" variant="ghost" size="sm">
              <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5" /> বাতিল
            </Button>
          }
          onConfirm={(reason) => cancelRequisition.mutate({ id: requisition.id, reason })}
          isLoading={cancelRequisition.isPending}
        />
      </div>
    </Card>
  );
}
