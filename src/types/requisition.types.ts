import type { OrderStatus } from "./invoice.types";

export type RequisitionPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RequisitionStatus = "PENDING" | "ORDERED" | "CANCELLED";

export type RequisitionSuggestedVendor = {
  vendorId: string;
  vendorName: string;
};

export type PendingRequisition = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  requiredQty: number;
  requiredDate?: string | null;
  notes?: string | null;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  requestedByName: string;
  createdAt: string;
  suggestedVendors: RequisitionSuggestedVendor[];
};

export type CompletedRequisition = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  priority: RequisitionPriority;
  requestedByName: string;
  createdAt: string;
  orderedQty: number;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: OrderStatus;
    orderedAt: string;
    vendorId: string;
    vendorName: string;
  } | null;
};

export type CreateRequisitionInput = {
  productId: string;
  requiredQty: number;
  unit: string;
  requiredDate?: string;
  notes?: string;
  priority: RequisitionPriority;
};

export type ConvertRequisitionInput = {
  invoiceId: string;
};
