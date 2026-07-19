import { Package, Store, ShoppingCart, Wallet } from "lucide-react";
import { AnalyticsStatCard } from "@/components/dashboard/AnalyticsStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";

/** The Dashboard's top-level rollup row — driven by the global date filter
 * only (unlike the 4 sections below, which each have their own independent
 * filters). Reuses whatever the Products/Vendors/Orders sections already
 * fetched for the same global range, rather than issuing its own 4th/5th/6th
 * request for numbers that are already in hand. */
export function OverallSummarySection({
  totalProducts,
  totalVendors,
  totalOrders,
  totalProcurementCost,
  isLoading,
}: {
  totalProducts: number | undefined;
  totalVendors: number | undefined;
  totalOrders: number | undefined;
  totalProcurementCost: number | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4">
      <AnalyticsStatCard icon={Package} label="মোট প্রোডাক্ট" value={`${totalProducts ?? 0} টি`} />
      <AnalyticsStatCard icon={Store} label="মোট ভেন্ডর" value={`${totalVendors ?? 0} টি`} />
      <AnalyticsStatCard icon={ShoppingCart} label="মোট অর্ডার" value={`${totalOrders ?? 0} টি`} />
      <AnalyticsStatCard
        icon={Wallet}
        label="মোট প্রোকিউরমেন্ট কস্ট"
        value={formatBDT(totalProcurementCost ?? 0)}
        isPrice
      />
    </div>
  );
}
