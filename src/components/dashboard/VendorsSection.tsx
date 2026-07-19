"use client";

import { useState } from "react";
import { Store, CheckCircle2, Ban, Truck } from "lucide-react";
import { DashboardSectionCard } from "@/components/dashboard/DashboardSectionCard";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { SectionPieChart } from "@/components/dashboard/SectionPieChart";
import { CHART_COLORS } from "@/components/dashboard/chart-colors";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useVendorStats } from "@/hooks/useDashboard";

type VendorStatusFilter = "all" | "ACTIVE" | "INACTIVE";

/** Fully self-contained — its own date/status filter state, its own
 * `useVendorStats` query, independent of every other section. */
export function VendorsSection() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<VendorStatusFilter>("all");

  const { data: stats, isLoading } = useVendorStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status === "all" ? undefined : status,
  });

  return (
    <DashboardSectionCard
      icon={Store}
      title="ভেন্ডর"
      filters={
        <>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" aria-label="শুরুর তারিখ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" aria-label="শেষ তারিখ" />
          <Select value={status} onValueChange={(v) => setStatus(v as VendorStatusFilter)}>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsStatCard icon={Store} label="মোট ভেন্ডর" value={`${stats?.totalVendors ?? 0} টি`} />
            <AnalyticsStatCard icon={CheckCircle2} label="অ্যাক্টিভ ভেন্ডর" value={`${stats?.activeVendors ?? 0} টি`} />
            <AnalyticsStatCard icon={Ban} label="ইনঅ্যাক্টিভ ভেন্ডর" value={`${stats?.inactiveVendors ?? 0} টি`} />
            <AnalyticsStatCard icon={Truck} label="মাসিক অ্যাক্টিভ সাপ্লায়ার" value={`${stats?.monthlyActiveSuppliers ?? 0} টি`} />
          </div>
        )
      }
      chart={
        isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <SectionPieChart
            data={[
              { name: "অ্যাক্টিভ", value: stats?.activeVendors ?? 0, color: CHART_COLORS.green },
              { name: "ইনঅ্যাক্টিভ", value: stats?.inactiveVendors ?? 0, color: CHART_COLORS.red },
              { name: "মাসিক অ্যাক্টিভ", value: stats?.monthlyActiveSuppliers ?? 0, color: CHART_COLORS.blue },
            ]}
          />
        )
      }
    />
  );
}
