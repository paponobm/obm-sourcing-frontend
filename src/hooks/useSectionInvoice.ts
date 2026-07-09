"use client";

import { useVendorInvoices, useInvoice } from "@/hooks/useInvoices";
import type { OrderStatus } from "@/types/invoice.types";

/** Resolves which invoice a vendor-workspace section (Pending / Warehouse Receive /
 * Closed) should show: the explicit `invoiceId` when navigated to from Order
 * History, otherwise the vendor's most recent invoice matching one of `statuses`
 * (the section's default entry point, e.g. via the "মাল রিসিভ করুন" action). */
export function useSectionInvoice(vendorId: string, statuses: readonly OrderStatus[], invoiceId?: string) {
  const { data: invoices, isLoading: isListLoading } = useVendorInvoices(vendorId);
  const resolvedId = invoiceId ?? invoices?.find((inv) => statuses.includes(inv.status))?.id;

  const { data: invoice, isLoading: isDetailLoading } = useInvoice(resolvedId ?? "");

  const isLoading = invoiceId ? isDetailLoading : isListLoading || (Boolean(resolvedId) && isDetailLoading);

  return { invoice, isLoading, hasTarget: Boolean(resolvedId) };
}
