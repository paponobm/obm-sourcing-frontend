"use client";

import { cn } from "@/lib/utils";

/** Comma-joined OrderStatus value(s) this tab sets as the active status
 * filter — "" means no filter (All). Pending bundles IN_TRANSIT+CONFIRMED
 * (a Confirmed order still hasn't reached the warehouse), matching Received
 * bundling RECEIVED+VERIFIED — both match the summary cards' own buckets. */
const TABS = [
  { key: "", label: "সব" },
  { key: "IN_TRANSIT,CONFIRMED", label: "পেন্ডিং" },
  { key: "RECEIVED,VERIFIED", label: "রিসিভড" },
  { key: "CLOSED", label: "ক্লোজড" },
  { key: "DISCREPANCY", label: "ডিসক্রেপান্সি" },
] as const;

export function OrderQuickFilters({
  active,
  onChange,
  tabs = TABS,
}: {
  active: string;
  onChange: (status: string) => void;
  tabs?: readonly { key: string; label: string }[];
}) {
  return (
    <div className="mb-3.5 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
              isActive ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
