"use client";

import { cn } from "@/lib/utils";
import { toBnDigits } from "@/utils/date";

export type RequisitionSectionKey = "pending" | "confirmed" | "cancelled" | "orderHistory";

/** Sticky horizontal section nav for the Requisition Management page — same
 * visual pattern as VendorSectionTabs.tsx, cloned rather than reused since
 * this page's tab set is its own domain (not vendor-scoped). */
export function RequisitionSectionTabs({
  active,
  onChange,
  counts,
}: {
  active: RequisitionSectionKey;
  onChange: (key: RequisitionSectionKey) => void;
  counts: Record<RequisitionSectionKey, number>;
}) {
  const tabs: { key: RequisitionSectionKey; label: string }[] = [
    { key: "pending", label: `পেন্ডিং (${toBnDigits(counts.pending)})` },
    { key: "confirmed", label: `কনফার্মড (${toBnDigits(counts.confirmed)})` },
    { key: "cancelled", label: `বাতিল (${toBnDigits(counts.cancelled)})` },
    { key: "orderHistory", label: `অর্ডার হিস্টরি (${toBnDigits(counts.orderHistory)})` },
  ];

  return (
    <div className="sticky top-0 z-10 mb-4 border-b border-line bg-paper pb-2 pt-1 print:hidden sm:mb-5 sm:pb-2.5">
      <div
        className="flex gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
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
    </div>
  );
}
