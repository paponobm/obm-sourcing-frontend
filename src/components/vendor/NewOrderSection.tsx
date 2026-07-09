"use client";

import { OrderCreatePanel } from "@/components/vendor/OrderCreatePanel";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import type { VendorWithProducts } from "@/types/vendor.types";

export function NewOrderSection({
  vendor,
  onNavigateSection,
}: {
  vendor: VendorWithProducts;
  onNavigateSection: NavigateToSection;
}) {
  return (
    <OrderCreatePanel
      vendor={vendor}
      onCreated={(invoiceId) => onNavigateSection("invoicePending", invoiceId)}
      onCancel={() => onNavigateSection("profile")}
    />
  );
}
