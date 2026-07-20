"use client";

import { cn } from "@/lib/utils";

export type VendorSectionKey =
  | "profile"
  | "newOrder"
  | "invoicePending"
  | "warehouseReceive"
  | "invoiceReceived"
  | "invoiceClosed"
  | "orderHistory"
  | "activityLog";

/** Shared callback shape for any action that jumps to another section of the
 * vendor workspace — optionally pinning a specific invoice (e.g. Order History's
 * "View", or "মাল রিসিভ করুন" carrying the just-updated invoice forward). Omitting
 * invoiceId lets the target section fall back to its own default lookup. */
export type NavigateToSection = (section: VendorSectionKey, invoiceId?: string) => void;

const TABS: { key: VendorSectionKey; label: string }[] = [
  { key: "profile", label: "প্রোফাইল" },
  { key: "newOrder", label: "নতুন অর্ডার" },
  // { key: "invoicePending", label: "ইনভয়েস (পেন্ডিং)" },
  // { key: "warehouseReceive", label: "ওয়্যারহাউজ রিসিভ চেক" },
  // { key: "invoiceReceived", label: "ইনভয়েস (রিসিভড)" },
  // { key: "invoiceClosed", label: "ইনভয়েস (ক্লোজড)" },
  { key: "orderHistory", label: "অর্ডার হিস্টরি" },
  { key: "activityLog", label: "অ্যাক্টিভিটি লগ" },
];

/** Sticky horizontal section nav for the vendor workspace — keeps every vendor-related
 * feature on one page instead of routing to separate URLs. */
export function VendorSectionTabs({
  active,
  onChange,
  newOrderDisabled,
}: {
  active: VendorSectionKey;
  onChange: (key: VendorSectionKey) => void;
  /** An Inactive vendor can't be ordered from — show the tab but disabled
   * (with an explanatory tooltip) instead of hiding it outright, so the
   * backend's real constraint is visible rather than the option just
   * silently disappearing with no explanation. */
  newOrderDisabled?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 mb-4 border-b border-line bg-paper pb-2 pt-1 print:hidden sm:mb-5 sm:pb-2.5">
      <div
        className="flex gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const isDisabled = tab.key === "newOrder" && newOrderDisabled;
          return (
            <button
              key={tab.key}
              type="button"
              disabled={isDisabled}
              title={isDisabled ? "ইনঅ্যাক্টিভ ভেন্ডরের জন্য নতুন অর্ডার তৈরি করা যাবে না" : undefined}
              onClick={() => onChange(tab.key)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm",
                isActive ? "bg-teal text-white shadow-md" : "bg-paper-2 text-ink hover:bg-line",
                isDisabled && "cursor-not-allowed opacity-50 hover:bg-paper-2",
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
