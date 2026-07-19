import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The "beautiful" icon+shadow+hover stat card — previously duplicated
 * byte-for-byte as a local `SummaryCard` in both `OrderSummaryCards.tsx` and
 * `OrderHistorySummaryCards.tsx`. Extracted here so the Dashboard's new
 * Product/Vendor/Order/Requisition sections use the exact same card as
 * those two existing surfaces, instead of a fourth copy.
 */
export function AnalyticsStatCard({
  icon: Icon,
  label,
  value,
  description,
  isPrice,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
  isPrice?: boolean;
}) {
  return (
    <div className="rounded-md border border-line bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel sm:px-4 sm:py-3.5 lg:px-[18px] lg:py-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-paper-2 text-teal sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="mb-1 text-[0.625rem] font-semibold text-gray sm:mb-1.5 sm:text-xs lg:text-[0.71875rem]">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-lg font-semibold sm:text-xl lg:text-2xl",
          isPrice ? "text-brass" : "text-teal-dark",
        )}
      >
        {value}
      </div>
      {description && <div className="mt-1 text-[0.625rem] text-gray sm:text-[0.6875rem]">{description}</div>}
    </div>
  );
}
