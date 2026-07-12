"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { PendingRequisitionList } from "./PendingRequisitionList";
import { CompletedOrderHistory } from "./CompletedOrderHistory";
import { NewRequisitionModal } from "./NewRequisitionModal";
import { usePendingRequisitions, useCompletedRequisitions } from "@/hooks/useRequisitions";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";

export function RequisitionDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);
  const { data: pending, isLoading: pendingLoading } = usePendingRequisitions();
  const { data: completed, isLoading: completedLoading } = useCompletedRequisitions();

  return (
    <>
      <Topbar
        title="রিকুইজিশন ম্যানেজমেন্ট"
        actions={
          canManage && (
            <Button type="button" variant="brass" onClick={() => setModalOpen(true)}>
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন রিকুইজিশন
            </Button>
          )
        }
      />

      <div className="mb-4 sm:mb-5">
        <h2 className="mb-2.5 font-serif text-sm text-teal-dark sm:mb-3 sm:text-base lg:text-lg">
          পেন্ডিং রিকুইজিশন ({pending?.length ?? 0} টি)
        </h2>
        <PendingRequisitionList requisitions={pending ?? []} isLoading={pendingLoading} />
      </div>

      <div>
        <h2 className="mb-2.5 font-serif text-sm text-teal-dark sm:mb-3 sm:text-base lg:text-lg">
          কমপ্লিটেড অর্ডার
        </h2>
        <CompletedOrderHistory requisitions={completed ?? []} isLoading={completedLoading} />
      </div>

      {canManage && <NewRequisitionModal open={modalOpen} onOpenChange={setModalOpen} />}
    </>
  );
}
