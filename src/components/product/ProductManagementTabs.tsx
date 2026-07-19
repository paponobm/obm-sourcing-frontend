"use client";

import { cn } from "@/lib/utils";
import { usePendingProductsCount } from "@/hooks/useProducts";

export type ProductManagementSectionKey = "all" | "pending" | "category" | "unit" | "courier";

/** Fixed top navigation for the unified Product Management page — merges
 * what used to be two separate tab bars/pages (`/products`'s own
 * সব প্রোডাক্ট/পেন্ডিং প্রোডাক্ট tabs, and `/categories`'s own
 * ক্যাটাগরি/ইউনিট/কুরিয়ার tabs) into one 5-tab bar, so Product Management is a
 * single page like Vendor/Requisition Management already are. Exact same
 * pill markup/classes as VendorSectionTabs/RequisitionSectionTabs — no new
 * navigation pattern introduced. */
export function ProductManagementTabs({
  active,
  onChange,
}: {
  active: ProductManagementSectionKey;
  onChange: (key: ProductManagementSectionKey) => void;
}) {
  const { data: pendingCount } = usePendingProductsCount();

  const tabs: { key: ProductManagementSectionKey; label: string }[] = [
    { key: "all", label: "প্রোডাক্ট তালিকা" },
    { key: "pending", label: `পেন্ডিং প্রোডাক্ট (${pendingCount ?? 0})` },
    { key: "category", label: "ক্যাটাগরি" },
    { key: "unit", label: "ইউনিট" },
    { key: "courier", label: "কুরিয়ার" },
  ];

  return (
    <div className="sticky top-0 z-10 mb-4 border-b border-line bg-paper pb-2 pt-1 print:hidden sm:mb-5 sm:pb-2.5">
      <div
        className="flex gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
              active === tab.key ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
