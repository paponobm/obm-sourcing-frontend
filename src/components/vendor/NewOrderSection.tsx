"use client";

import { OrderCreatePanel } from "@/components/vendor/OrderCreatePanel";
import type { NavigateToSection } from "@/components/vendor/VendorSectionTabs";
import { useConvertRequisition } from "@/hooks/useRequisitions";
import type { VendorWithProducts } from "@/types/vendor.types";

export function NewOrderSection({
  vendor,
  onNavigateSection,
  requisitionId,
  prefillProductId,
  prefillQty,
}: {
  vendor: VendorWithProducts;
  onNavigateSection: NavigateToSection;
  requisitionId?: string;
  prefillProductId?: string;
  prefillQty?: string;
}) {
  const convertRequisition = useConvertRequisition();

  const handleCreated = async (invoiceId: string) => {
    if (requisitionId) {
      await convertRequisition.mutateAsync({ id: requisitionId, input: { invoiceId } });
    }
    onNavigateSection("invoicePending", invoiceId);
  };

  return (
    <OrderCreatePanel
      vendor={vendor}
      onCreated={handleCreated}
      onCancel={() => onNavigateSection("profile")}
      prefillProductId={prefillProductId}
      prefillQty={prefillQty}
    />
  );
}
