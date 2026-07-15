"use client";

import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatBnDate, toBnDigits } from "@/utils/date";
import { REQUISITION_PRIORITY_LABEL_BN, requisitionPriorityBadgeVariant } from "@/utils/status";
import type { Requisition } from "@/types/requisition.types";

function CancelledRequisitionCard({ requisition, onViewDetails }: { requisition: Requisition; onViewDetails: () => void }) {
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
            বাতিল করেছেন: {requisition.cancelledByName} · {requisition.cancelledAt ? formatBnDate(requisition.cancelledAt) : ""}
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onViewDetails}>
          <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> বিস্তারিত দেখুন
        </Button>
      </div>

      <p className="mt-2 text-xs text-gray sm:text-sm">
        {requisition.items.map((i) => `${i.productName} (${toBnDigits(i.requiredQty)} ${i.unit})`).join(", ")}
      </p>

      {requisition.cancellationReason && (
        <p className="mt-2 rounded-md bg-paper-2 px-2.5 py-2 text-[11px] text-ink sm:text-xs">
          বাতিলের কারণ: {requisition.cancellationReason}
        </p>
      )}
    </Card>
  );
}

export function CancelledRequisitionList({
  requisitions,
  isLoading,
  onViewDetails,
}: {
  requisitions: Requisition[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (requisitions.length === 0) {
    return (
      <Card>
        <EmptyState title="কোনো বাতিল রিকুইজিশন নেই" description="কোনো রিকুইজিশন বাতিল করলে সেটি এখানে দেখাবে।" />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requisitions.map((r) => (
        <CancelledRequisitionCard key={r.id} requisition={r} onViewDetails={() => onViewDetails(r.id)} />
      ))}
    </div>
  );
}
