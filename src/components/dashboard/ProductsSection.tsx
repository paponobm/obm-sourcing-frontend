"use client";

import { useState } from "react";
import { Package, CheckCircle2, Ban } from "lucide-react";
import { DashboardSectionCard } from "@/components/dashboard/DashboardSectionCard";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { SectionPieChart } from "@/components/dashboard/SectionPieChart";
import { CHART_COLORS } from "@/components/dashboard/chart-colors";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickDateRangeSelect } from "@/components/shared/QuickDateRangeSelect";
import { useProductStats } from "@/hooks/useDashboard";
import { useCategories } from "@/hooks/useCategories";
import { getQuickDateRange } from "@/utils/quick-date-range";
import { toBnDigits } from "@/utils/date";

type ProductStatusFilter = "all" | "ACTIVE" | "INACTIVE";

/** Fully self-contained — its own date/category/status filter state, its own
 * `useProductStats` query. Changing any filter here only re-fetches this
 * section (a new React Query key), never touches Vendors/Orders/Requisitions.
 * Date range defaults to Today (see QuickDateRangeSelect). */
export function ProductsSection() {
  const [dateFrom, setDateFrom] = useState(() => getQuickDateRange("today").dateFrom);
  const [dateTo, setDateTo] = useState(() => getQuickDateRange("today").dateTo);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");

  const { data: categories } = useCategories();
  const { data: stats, isLoading } = useProductStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    categoryId: categoryId || undefined,
    status: status === "all" ? undefined : status,
  });

  return (
    <DashboardSectionCard
      icon={Package}
      title="প্রোডাক্ট"
      filters={
        <>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" aria-label="শুরুর তারিখ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" aria-label="শেষ তারিখ" />
          <QuickDateRangeSelect dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={setDateFrom} onDateToChange={setDateTo} />
          <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as ProductStatusFilter)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="ACTIVE">অ্যাক্টিভ</SelectItem>
              <SelectItem value="INACTIVE">ইনঅ্যাক্টিভ</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
      cards={
        isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AnalyticsStatCard icon={Package} label="মোট প্রোডাক্ট" value={`${toBnDigits(stats?.totalProducts ?? 0)} টি`} />
            <AnalyticsStatCard icon={CheckCircle2} label="অ্যাক্টিভ প্রোডাক্ট" value={`${toBnDigits(stats?.activeProducts ?? 0)} টি`} />
            <AnalyticsStatCard icon={Ban} label="ইনঅ্যাক্টিভ প্রোডাক্ট" value={`${toBnDigits(stats?.inactiveProducts ?? 0)} টি`} />
          </div>
        )
      }
      chart={
        isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <SectionPieChart
            data={[
              { name: "অ্যাক্টিভ", value: stats?.activeProducts ?? 0, color: CHART_COLORS.green },
              { name: "ইনঅ্যাক্টিভ", value: stats?.inactiveProducts ?? 0, color: CHART_COLORS.red },
            ]}
          />
        )
      }
    />
  );
}
