"use client";

import { OrderCreatePanel } from "@/components/vendor/OrderCreatePanel";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useRequisitionVendorItems } from "@/hooks/useRequisitions";
import type { VendorWithProducts } from "@/types/vendor.types";

export function NewOrderSection({
  vendor,
  onNavigateSection,
  onBack,
  requisitionId,
}: {
  vendor: VendorWithProducts;
  onNavigateSection: NavigateToSection;
  /** Cancel — undoes the last in-app navigation via the browser history
   * stack, rather than always redirecting to a fixed "profile" section. */
  onBack: () => void;
  requisitionId?: string;
}) {
  // Only this requisition's still-unordered items which this vendor sells —
  // linking/fulfillment itself happens server-side inside invoice creation
  // (InvoicesService.createForVendor), not via a separate "convert" call.
  const { data: vendorItems } = useRequisitionVendorItems(requisitionId, vendor.id);
  const prefillItems = vendorItems?.map((i) => ({
    productId: i.productId,
    qty: i.requiredQty,
    requisitionItemId: i.requisitionItemId,
  }));

  const handleCreated = (invoiceId: string) => {
    onNavigateSection("invoicePending", invoiceId);
  };

  return (
    <OrderCreatePanel
      vendor={vendor}
      onCreated={handleCreated}
      onCancel={onBack}
      prefillItems={prefillItems}
    />
  );
}
