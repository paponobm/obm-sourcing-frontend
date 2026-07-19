"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import {
  VendorSectionTabs,
  type VendorSectionKey,
  type NavigateToSection,
} from "@/components/vendor/VendorSectionTabs";
import { ProfileSection } from "@/components/vendor/ProfileSection";
import { NewOrderSection } from "@/components/vendor/NewOrderSection";
import { PendingInvoiceSection } from "@/components/vendor/PendingInvoiceSection";
import { WarehouseReceiveCheckSection } from "@/components/vendor/WarehouseReceiveCheckSection";
import { ClosedInvoiceSection } from "@/components/vendor/ClosedInvoiceSection";
import { ReceivedInvoiceSection } from "@/components/vendor/ReceivedInvoiceSection";
import { OrderHistorySection } from "@/components/vendor/OrderHistorySection";
import { VendorActivityLogSection } from "@/components/vendor/VendorActivityLogSection";
import { useVendor } from "@/hooks/useVendor";
import { ROUTES } from "@/constants/routes";
import { goBackOrFallback } from "@/lib/utils";

const VALID_SECTIONS: VendorSectionKey[] = [
  "profile",
  "newOrder",
  "invoicePending",
  "warehouseReceive",
  "invoiceReceived",
  "invoiceClosed",
  "orderHistory",
  "activityLog",
];

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: vendor, isLoading } = useVendor(id);

  // The current section/invoice live entirely in the URL (not local state) —
  // deep-linked from a Confirmed requisition's vendor chip (?tab=newOrder&
  // requisitionId=...), the global Order Management table's "View" action
  // (?tab=invoicePending&invoiceId=...), or just whichever tab was last
  // pushed below. Reading straight from searchParams on every render (rather
  // than snapshotting into useState once on mount) means a browser refresh
  // always lands back on the same section instead of reverting to Profile.
  const tabParam = searchParams.get("tab");
  const activeSection: VendorSectionKey = VALID_SECTIONS.includes(tabParam as VendorSectionKey)
    ? (tabParam as VendorSectionKey)
    : "profile";
  const selectedInvoiceId = searchParams.get("invoiceId") ?? undefined;
  const requisitionId = searchParams.get("requisitionId") ?? undefined;

  // Every section switch pushes a real history entry (?tab=...) instead of
  // silently mutating local state, so the browser Back/Forward stack steps
  // through tabs one at a time — New Order -> Profile -> Vendor List -
  // instead of skipping straight past Profile to the Vendor List.
  const navigate: NavigateToSection = (section, invoiceId) => {
    const params = new URLSearchParams();
    params.set("tab", section);
    if (invoiceId) params.set("invoiceId", invoiceId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // For genuine "Cancel"/"go back" actions (not lateral tab switches) —
  // undoes the last in-app navigation via the browser history stack rather
  // than force-redirecting to a fixed "profile" URL.
  const goBack = () => goBackOrFallback(router, `${pathname}?tab=profile`);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:gap-[18px]">
        <Skeleton className="h-56 w-full sm:h-60 lg:h-64 lg:w-[270px] lg:shrink-0" />
        <Skeleton className="h-56 flex-1 sm:h-60 lg:h-64" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <EmptyState
        title="ভেন্ডর পাওয়া যায়নি"
        description="এই ভেন্ডরটি হয়তো মুছে ফেলা হয়েছে বা লিংকটি ভুল।"
        action={
          <Button asChild variant="ghost" className="mt-2">
            <Link href={ROUTES.vendors}>ভেন্ডর তালিকায় ফিরে যান</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <VendorHeader vendor={vendor} />
      <VendorSectionTabs
        active={activeSection}
        onChange={(key) => navigate(key)}
        hideNewOrder={vendor.status === "INACTIVE"}
      />

      <div key={activeSection} className="animate-in fade-in-0 duration-300">
        {activeSection === "profile" && <ProfileSection vendor={vendor} />}
        {activeSection === "newOrder" && (
          <NewOrderSection
            vendor={vendor}
            onNavigateSection={navigate}
            onBack={goBack}
            requisitionId={requisitionId}
          />
        )}
        {activeSection === "invoicePending" && (
          <PendingInvoiceSection vendorId={vendor.id} invoiceId={selectedInvoiceId} onNavigateSection={navigate} />
        )}
        {activeSection === "warehouseReceive" && (
          <WarehouseReceiveCheckSection
            vendorId={vendor.id}
            invoiceId={selectedInvoiceId}
            onNavigateSection={navigate}
          />
        )}
        {activeSection === "invoiceClosed" && (
          <ClosedInvoiceSection vendorId={vendor.id} invoiceId={selectedInvoiceId} />
        )}
        {activeSection === "invoiceReceived" && <ReceivedInvoiceSection />}
        {activeSection === "orderHistory" && <OrderHistorySection vendorId={vendor.id} onNavigateSection={navigate} />}
        {activeSection === "activityLog" && <VendorActivityLogSection vendorId={vendor.id} />}
      </div>
    </>
  );
}
