"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useVendor } from "@/hooks/useVendor";
import { ROUTES } from "@/constants/routes";

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading } = useVendor(id);
  const [activeSection, setActiveSection] = useState<VendorSectionKey>("profile");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>();

  const navigate: NavigateToSection = (section, invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setActiveSection(section);
  };

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
      <VendorSectionTabs active={activeSection} onChange={(key) => navigate(key)} />

      <div key={activeSection} className="animate-in fade-in-0 duration-300">
        {activeSection === "profile" && <ProfileSection vendor={vendor} />}
        {activeSection === "newOrder" && <NewOrderSection vendor={vendor} onNavigateSection={navigate} />}
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
      </div>
    </>
  );
}
