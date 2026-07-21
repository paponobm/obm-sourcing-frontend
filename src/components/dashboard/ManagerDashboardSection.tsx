"use client";

import { ClipboardList, CheckCircle2, XCircle, Package } from "lucide-react";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useAuth";
import { useRequisitionSummary } from "@/hooks/useRequisitions";
import { useProducts } from "@/hooks/useProducts";

/** Manager's restricted Panel dashboard — just their own contribution
 * numbers, none of the Super Admin's global tabbed analytics. Requisition
 * counts come from the existing `createdById`-filterable summary endpoint;
 * the product count reads the paginated `/products` list's `total`, which
 * the backend already scopes to the Manager's own submissions. */
export function ManagerDashboardSection() {
  const { data: user } = useCurrentUser();
  const { data: requisitionSummary, isLoading: requisitionsLoading } = useRequisitionSummary({
    createdById: user?.id,
  });
  const { data: productsPage, isLoading: productsLoading } = useProducts({ pageSize: 1 });

  const isLoading = requisitionsLoading || productsLoading;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
      ) : (
        <>
          <AnalyticsStatCard
            icon={ClipboardList}
            label="মোট রিকুইজিশন তৈরি"
            value={`${requisitionSummary?.totalRequisitions ?? 0} টি`}
          />
          <AnalyticsStatCard
            icon={CheckCircle2}
            label="কনফার্মড রিকুইজিশন"
            value={`${requisitionSummary?.confirmedCount ?? 0} টি`}
          />
          <AnalyticsStatCard
            icon={XCircle}
            label="বাতিল রিকুইজিশন"
            value={`${requisitionSummary?.cancelledCount ?? 0} টি`}
          />
          <AnalyticsStatCard icon={Package} label="মোট প্রোডাক্ট যোগ" value={`${productsPage?.total ?? 0} টি`} />
        </>
      )}
    </div>
  );
}
