"use client";

import { cn } from "@/lib/utils";
import { usePendingProductsCount } from "@/hooks/useProducts";

export type ProductSectionKey = "all" | "pending";

/** Fixed top navigation for the Products page — mirrors VendorSectionTabs'
 * exact pill markup/classes, just with two tabs instead of a vendor
 * workspace's several. */
export function ProductSectionTabs({
  active,
  onChange,
}: {
  active: ProductSectionKey;
  onChange: (key: ProductSectionKey) => void;
}) {
  const { data: pendingCount } = usePendingProductsCount();

  return (
    <div className="sticky top-0 z-10 mb-4 border-b border-line bg-paper pb-2 pt-1 print:hidden sm:mb-5 sm:pb-2.5">
      <div
        className="flex gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
            active === "all" ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
          )}
        >
          সব প্রোডাক্ট
        </button>
        <button
          type="button"
          onClick={() => onChange("pending")}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
            active === "pending" ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
          )}
        >
          পেন্ডিং প্রোডাক্ট ({pendingCount ?? 0})
        </button>
      </div>
    </div>
  );
}
