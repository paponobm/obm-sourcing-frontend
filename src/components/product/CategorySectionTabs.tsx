"use client";

import { cn } from "@/lib/utils";

export type CategorySectionKey = "category" | "unit" | "courier";

/** Fixed top navigation for the Product Category page — mirrors
 * VendorSectionTabs'/ProductSectionTabs' exact pill markup/classes, just
 * with "ক্যাটাগরি"/"ইউনিট"/"কুরিয়ার" instead of a vendor workspace's several. */
export function CategorySectionTabs({
  active,
  onChange,
}: {
  active: CategorySectionKey;
  onChange: (key: CategorySectionKey) => void;
}) {
  return (
    <div className="sticky top-0 z-10 mb-4 border-b border-line bg-paper pb-2 pt-1 print:hidden sm:mb-5 sm:pb-2.5">
      <div
        className="flex gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          type="button"
          onClick={() => onChange("category")}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
            active === "category" ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
          )}
        >
          ক্যাটাগরি
        </button>
        <button
          type="button"
          onClick={() => onChange("unit")}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
            active === "unit" ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
          )}
        >
          ইউনিট
        </button>
        <button
          type="button"
          onClick={() => onChange("courier")}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
            active === "courier" ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
          )}
        >
          কুরিয়ার
        </button>
      </div>
    </div>
  );
}
