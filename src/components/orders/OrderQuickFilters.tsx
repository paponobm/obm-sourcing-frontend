"use client";

import { cn } from "@/lib/utils";

/** Comma-joined OrderStatus value(s) this tab sets as the active status
 * filter — "" means no filter (All). Pending (IN_TRANSIT) and On The Way
 * (CONFIRMED) are each their own distinct tab/status now — Received and
 * Verified are their own separate tabs too (a Manager-verified order awaiting
 * Admin's Close is a distinctly actionable state, not just "received"). */
const TABS = [
  { key: "", label: "সব" },
  { key: "IN_TRANSIT", label: "পেন্ডিং" },
  { key: "CONFIRMED", label: "পথে আছে" },
  { key: "RECEIVED", label: "রিসিভড" },
  { key: "VERIFIED", label: "ভেরিফায়েড" },
  { key: "CLOSED", label: "ক্লোজড" },
  { key: "DISCREPANCY", label: "পণ্যের অমিল" },
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
