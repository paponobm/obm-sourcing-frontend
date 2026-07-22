"use client";

import { useState } from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { DashboardSectionCard } from "@/components/dashboard/DashboardSectionCard";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { SectionPieChart } from "@/components/dashboard/SectionPieChart";
import { CHART_COLORS } from "@/components/dashboard/chart-colors";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickDateRangeSelect } from "@/components/shared/QuickDateRangeSelect";
import { useRequisitionSummary } from "@/hooks/useRequisitions";
import { getQuickDateRange } from "@/utils/quick-date-range";
import { toBnDigits } from "@/utils/date";

type RequisitionStatusFilter = "all" | "PENDING" | "CONFIRMED" | "ORDERED" | "CANCELLED";

const STATUS_LABEL: Record<Exclude<RequisitionStatusFilter, "all">, string> = {
  PENDING: "পেন্ডিং",
  CONFIRMED: "কনফার্মড",
  ORDERED: "সম্পন্ন",
  CANCELLED: "বাতিল",
};

/** Fully self-contained — its own date/status filter state, its own
 * `useRequisitionSummary` query, independent of every other section. Date
 * range defaults to Today (see QuickDateRangeSelect). */
export function RequisitionsSection() {
  const [dateFrom, setDateFrom] = useState(() => getQuickDateRange("today").dateFrom);
  const [dateTo, setDateTo] = useState(() => getQuickDateRange("today").dateTo);
  const [status, setStatus] = useState<RequisitionStatusFilter>("all");

  const { data: summary, isLoading } = useRequisitionSummary({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status === "all" ? undefined : status,
  });

  return (
    <DashboardSectionCard
      icon={ClipboardList}
      title="রিকুইজিশন"
      filters={
        <>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" aria-label="শুরুর তারিখ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" aria-label="শেষ তারিখ" />
          <QuickDateRangeSelect dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={setDateFrom} onDateToChange={setDateTo} />
          <Select value={status} onValueChange={(v) => setStatus(v as RequisitionStatusFilter)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
      cards={
        isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnalyticsStatCard icon={ClipboardList} label="মোট রিকুইজিশন" value={`${toBnDigits(summary?.totalRequisitions ?? 0)} টি`} />
            <AnalyticsStatCard icon={Clock} label="পেন্ডিং" value={`${toBnDigits(summary?.pendingCount ?? 0)} টি`} />
            <AnalyticsStatCard icon={CheckCircle2} label="কনফার্মড" value={`${toBnDigits(summary?.confirmedCount ?? 0)} টি`} />
            <AnalyticsStatCard icon={XCircle} label="বাতিল" value={`${toBnDigits(summary?.cancelledCount ?? 0)} টি`} />
            <AnalyticsStatCard icon={PackageCheck} label="সম্পন্ন" value={`${toBnDigits(summary?.completedCount ?? 0)} টি`} />
          </div>
        )
      }
      chart={
        isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <SectionPieChart
            data={[
              { name: "পেন্ডিং", value: summary?.pendingCount ?? 0, color: CHART_COLORS.orange },
              { name: "কনফার্মড", value: summary?.confirmedCount ?? 0, color: CHART_COLORS.green },
              { name: "বাতিল", value: summary?.cancelledCount ?? 0, color: CHART_COLORS.red },
              { name: "সম্পন্ন", value: summary?.completedCount ?? 0, color: CHART_COLORS.blue },
            ]}
          />
        )
      }
    />
  );
}
