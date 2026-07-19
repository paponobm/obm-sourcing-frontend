"use client";

import { useState } from "react";
import { ShoppingCart, Clock, PackageCheck, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import { DashboardSectionCard } from "@/components/dashboard/DashboardSectionCard";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { SectionPieChart } from "@/components/dashboard/SectionPieChart";
import { CHART_COLORS } from "@/components/dashboard/chart-colors";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderStats } from "@/hooks/useDashboard";
import { useVendors } from "@/hooks/useVendors";
import { formatBDT } from "@/utils/currency";
import { ORDER_STATUS_LABEL_BN } from "@/utils/status";
import type { OrderStatus } from "@/types/invoice.types";

const ORDER_STATUSES: OrderStatus[] = ["IN_TRANSIT", "RECEIVED", "DISCREPANCY", "VERIFIED", "CLOSED"];

/** Fully self-contained — its own date/status/vendor filter state, its own
 * `useOrderStats` query, independent of every other section. Unlike the real
 * Order Management page's `useOrderSummary` (always the full unfiltered
 * snapshot), this aggregates the existing filterable `/invoices` list
 * endpoint client-side so these filters actually narrow the numbers. */
export function OrdersSection() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [vendorId, setVendorId] = useState("");

  const { data: vendorsPage } = useVendors({ page: 1, pageSize: 100 });
  const { data: summary, isLoading } = useOrderStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status === "all" ? undefined : status,
    vendorId: vendorId || undefined,
  });

  return (
    <DashboardSectionCard
      icon={ShoppingCart}
      title="অর্ডার"
      filters={
        <>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" aria-label="শুরুর তারিখ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" aria-label="শেষ তারিখ" />
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL_BN[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={vendorId || "all"} onValueChange={(v) => setVendorId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="সব ভেন্ডর" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ভেন্ডর</SelectItem>
              {vendorsPage?.data.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.shopName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
      cards={
        isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnalyticsStatCard icon={ShoppingCart} label="মোট অর্ডার" value={`${summary?.totalOrders ?? 0} টি`} />
            <AnalyticsStatCard icon={Clock} label="পেন্ডিং" value={`${summary?.pendingOrders ?? 0} টি`} />
            <AnalyticsStatCard icon={PackageCheck} label="রিসিভড" value={`${summary?.receivedOrders ?? 0} টি`} />
            <AnalyticsStatCard icon={CheckCircle2} label="ক্লোজড" value={`${summary?.closedOrders ?? 0} টি`} />
            <AnalyticsStatCard icon={AlertTriangle} label="ডিসক্রেপান্সি" value={`${summary?.discrepancyOrders ?? 0} টি`} />
            <AnalyticsStatCard
              icon={Wallet}
              label="গ্র্যান্ড টোটাল কস্ট"
              value={formatBDT(summary?.totalProcurementCost ?? 0)}
              isPrice
            />
          </div>
        )
      }
      chart={
        isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <SectionPieChart
            data={[
              { name: "পেন্ডিং", value: summary?.pendingOrders ?? 0, color: CHART_COLORS.orange },
              { name: "রিসিভড", value: summary?.receivedOrders ?? 0, color: CHART_COLORS.green },
              { name: "ক্লোজড", value: summary?.closedOrders ?? 0, color: CHART_COLORS.blue },
              { name: "ডিসক্রেপান্সি", value: summary?.discrepancyOrders ?? 0, color: CHART_COLORS.red },
            ]}
          />
        )
      }
    />
  );
}
