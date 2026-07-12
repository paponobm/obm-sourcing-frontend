import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { RequisitionCard } from "./RequisitionCard";
import type { PendingRequisition } from "@/types/requisition.types";

export function PendingRequisitionList({
  requisitions,
  isLoading,
}: {
  requisitions: PendingRequisition[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (requisitions.length === 0) {
    return (
      <Card>
        <EmptyState
          title="কোনো পেন্ডিং রিকুইজিশন নেই"
          description="নতুন রিকুইজিশন তৈরি করলে সেটি এখানে দেখাবে।"
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
      {requisitions.map((r) => (
        <RequisitionCard key={r.id} requisition={r} />
      ))}
    </div>
  );
}
