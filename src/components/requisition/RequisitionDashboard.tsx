"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequisitionSectionTabs, type RequisitionSectionKey } from "./RequisitionSectionTabs";
import { PendingRequisitionList } from "./PendingRequisitionList";
import { ConfirmedRequisitionList } from "./ConfirmedRequisitionList";
import { CancelledRequisitionList } from "./CancelledRequisitionList";
import { RequisitionOrderHistorySection } from "./RequisitionOrderHistorySection";
import { NewRequisitionModal } from "./NewRequisitionModal";
import { RequisitionDetailModal } from "./RequisitionDetailModal";
import {
  usePendingRequisitions,
  useConfirmedRequisitions,
  useCancelledRequisitions,
  useRequisitionOrderHistory,
} from "@/hooks/useRequisitions";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";
import type { Requisition } from "@/types/requisition.types";

/** Page header (title + "নতুন রিকুইজিশন") stays fixed above the tabs at all
 * times, per the requested layout — only the tab content below changes. */
export function RequisitionDashboard() {
  const [activeSection, setActiveSection] = useState<RequisitionSectionKey>("pending");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<Requisition | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);

  const { data: pending, isLoading: pendingLoading } = usePendingRequisitions();
  const { data: confirmed, isLoading: confirmedLoading } = useConfirmedRequisitions();
  const { data: cancelled, isLoading: cancelledLoading } = useCancelledRequisitions();
  const { data: orderHistory } = useRequisitionOrderHistory();

  return (
    <TooltipProvider delayDuration={200}>
      <Topbar
        title="রিকুইজিশন ম্যানেজমেন্ট"
        actions={
          canManage && (
            <Button type="button" variant="brass" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন রিকুইজিশন
            </Button>
          )
        }
      />

      <RequisitionSectionTabs
        active={activeSection}
        onChange={setActiveSection}
        counts={{
          pending: pending?.length ?? 0,
          confirmed: confirmed?.length ?? 0,
          cancelled: cancelled?.length ?? 0,
          orderHistory: orderHistory?.length ?? 0,
        }}
      />

      <div key={activeSection} className="animate-in fade-in-0 duration-300">
        {activeSection === "pending" && (
          <PendingRequisitionList
            requisitions={pending ?? []}
            isLoading={pendingLoading}
            onViewDetails={setDetailId}
            onEdit={setEditingRequisition}
          />
        )}
        {activeSection === "confirmed" && (
          <ConfirmedRequisitionList
            requisitions={confirmed ?? []}
            isLoading={confirmedLoading}
            onViewDetails={setDetailId}
          />
        )}
        {activeSection === "cancelled" && (
          <CancelledRequisitionList
            requisitions={cancelled ?? []}
            isLoading={cancelledLoading}
            onViewDetails={setDetailId}
          />
        )}
        {activeSection === "orderHistory" && <RequisitionOrderHistorySection />}
      </div>

      {canManage && (
        <NewRequisitionModal
          open={createOpen || Boolean(editingRequisition)}
          onOpenChange={(open) => {
            if (!open) {
              setCreateOpen(false);
              setEditingRequisition(null);
            }
          }}
          editingRequisition={editingRequisition}
        />
      )}

      <RequisitionDetailModal requisitionId={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
    </TooltipProvider>
  );
}
