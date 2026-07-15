import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmedRequisitionCard } from "./ConfirmedRequisitionCard";
import type { Requisition } from "@/types/requisition.types";

export function ConfirmedRequisitionList({
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
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (requisitions.length === 0) {
    return (
      <Card>
        <EmptyState
          title="কোনো কনফার্মড রিকুইজিশন নেই"
          description="পেন্ডিং রিকুইজিশন কনফার্ম করলে সেটি এখানে দেখাবে।"
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requisitions.map((r) => (
        <ConfirmedRequisitionCard key={r.id} requisition={r} onViewDetails={() => onViewDetails(r.id)} />
      ))}
    </div>
  );
}
