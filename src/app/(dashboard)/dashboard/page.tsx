"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Package, Store, ShoppingCart, ClipboardList } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatRow } from "@/components/dashboard/StatRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverallSummarySection } from "@/components/dashboard/OverallSummarySection";
import { ProductsSection } from "@/components/dashboard/ProductsSection";
import { VendorsSection } from "@/components/dashboard/VendorsSection";
import { OrdersSection } from "@/components/dashboard/OrdersSection";
import { RequisitionsSection } from "@/components/dashboard/RequisitionsSection";
import { RecentPriceUpdatesTable } from "@/components/dashboard/RecentPriceUpdatesTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  useDashboardStats,
  useProductStats,
  useVendorStats,
  useOrderStats,
  useRecentPriceUpdates,
} from "@/hooks/useDashboard";
import { useActivities } from "@/hooks/useActivities";
import { cn } from "@/lib/utils";

type DashboardTab = "overview" | "product" | "vendor" | "order" | "requisition";

const TABS: { key: DashboardTab; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "ওভারভিউ", icon: LayoutGrid },
  { key: "product", label: "প্রোডাক্ট", icon: Package },
  { key: "vendor", label: "ভেন্ডর", icon: Store },
  { key: "order", label: "অর্ডার", icon: ShoppingCart },
  { key: "requisition", label: "রিকুইজিশন", icon: ClipboardList },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("overview");

  // Always the full, unfiltered rollup — independent of whatever date/status
  // filters a user has dialed into the section tabs below, matching
  // OverallSummarySection's own "global at-a-glance" intent.
  const { data: productStats, isLoading: productStatsLoading } = useProductStats();
  const { data: vendorStats, isLoading: vendorStatsLoading } = useVendorStats();
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: updates, isLoading: updatesLoading } = useRecentPriceUpdates();
  const { data: activityPage, isLoading: activitiesLoading } = useActivities({ pageSize: 5 });

  return (
    <>
      <Topbar title="ড্যাশবোর্ড" />

      <nav
        className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap gap-1.5 border-b border-line bg-paper/95 px-4 py-2 backdrop-blur sm:mb-5 md:-mx-[26px] md:px-[26px]"
        aria-label="ড্যাশবোর্ড সেকশন"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              tab === key ? "bg-teal text-white" : "text-teal-dark hover:bg-paper-2",
            )}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* <OverallSummarySection
        totalProducts={productStats?.totalProducts}
        totalVendors={vendorStats?.totalVendors}
        totalOrders={orderStats?.totalOrders}
        totalProcurementCost={orderStats?.totalProcurementCost}
        isLoading={productStatsLoading || vendorStatsLoading || orderStatsLoading}
      /> */}

      {tab === "overview" && (
        <>
          <StatRow>
            <StatCard
              label="মোট ভেন্ডর"
              value={statsLoading ? "..." : String(stats?.totalVendors ?? 0)}
              delta={statsLoading ? undefined : `${stats?.activeVendors} অ্যাক্টিভ`}
            />
            <StatCard
              label="মোট প্রোডাক্ট"
              value={statsLoading ? "..." : String(stats?.totalProducts ?? 0)}
              delta={statsLoading ? undefined : `+${stats?.newProductsThisWeek} এই সপ্তাহে`}
            />
            <StatCard
              label="আজ দাম আপডেট হয়েছে"
              value={statsLoading ? "..." : String(stats?.priceUpdatesToday ?? 0)}
              delta={
                statsLoading ? undefined : `${stats?.priceUpdatesFromVendorsCount} জন ভেন্ডর থেকে`
              }
            />
            <StatCard
              label="দাম-পার্থক্য বেশি এমন প্রোডাক্ট"
              value={statsLoading ? "..." : String(stats?.priceDiscrepancyCount ?? 0)}
              delta="রিভিউ প্রয়োজন"
              deltaVariant="brass"
            />
          </StatRow>

          <div className="flex flex-col gap-[18px] lg:flex-row">
            <div className="flex-1">
              <RecentPriceUpdatesTable updates={updates} isLoading={updatesLoading} />
            </div>
            <div className="w-full lg:w-[270px] lg:shrink-0">
              <ActivityFeed activities={activityPage?.data} isLoading={activitiesLoading} />
            </div>
          </div>
        </>
      )}
      {tab === "product" && <ProductsSection />}
      {tab === "vendor" && <VendorsSection />}
      {tab === "order" && <OrdersSection />}
      {tab === "requisition" && <RequisitionsSection />}
    </>
  );
}
