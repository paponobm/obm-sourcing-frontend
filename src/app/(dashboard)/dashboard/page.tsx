"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { SearchBox } from "@/components/shared/SearchBox";
import { StatRow } from "@/components/dashboard/StatRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPriceUpdatesTable } from "@/components/dashboard/RecentPriceUpdatesTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useDashboardStats, useRecentPriceUpdates } from "@/hooks/useDashboard";
import { useActivities } from "@/hooks/useActivities";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: updates, isLoading: updatesLoading } = useRecentPriceUpdates();
  const { data: activityPage, isLoading: activitiesLoading } = useActivities({ pageSize: 5 });

  return (
    <>
      <Topbar
        title="ড্যাশবোর্ড"
        actions={<SearchBox value={search} onChange={setSearch} />}
      />

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
  );
}
