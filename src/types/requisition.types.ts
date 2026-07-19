import type { OrderStatus } from "./invoice.types";

export type RequisitionPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RequisitionStatus = "PENDING" | "CONFIRMED" | "ORDERED" | "CANCELLED";

/** Every active vendor selling this product, each with the same
 * price/orderCount/lastOrderedAt detail the tooltip shows — not just the
 * single highlighted "Suggested Vendor" (see RequisitionTopSuggestedVendor,
 * which is just one of these). */
export type RequisitionSuggestedVendor = {
  vendorId: string;
  vendorName: string;
  price: number;
  orderCount: number;
  lastOrderedAt: string | null;
};

/** The single vendor highlighted as "Suggested Vendor" for one product —
 * whichever vendor it was most recently ordered from, or (if never ordered)
 * the cheapest active vendor. Null only when no active vendor sells the
 * product at all. Structurally identical to RequisitionSuggestedVendor —
 * kept as its own name since it means something distinct ("the one pick"
 * vs. "any candidate in the full list"). */
export type RequisitionTopSuggestedVendor = RequisitionSuggestedVendor;

export type RequisitionItem = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  requiredQty: number;
  notes?: string | null;
  /** Set once this item has been included on some vendor's invoice — a
   * Confirmed requisition can have a mix of fulfilled/unfulfilled items. */
  fulfilled: boolean;
  suggestedVendors: RequisitionSuggestedVendor[];
  suggestedVendor: RequisitionTopSuggestedVendor | null;
};

export type Requisition = {
  id: string;
  requisitionCode: string;
  requiredDate?: string | null;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  requestedByName: string;
  createdAt: string;
  items: RequisitionItem[];
  confirmedByName?: string | null;
  confirmedAt?: string | null;
  cancelledByName?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
};

export type RequisitionOrderHistoryItem = {
  productId: string;
  productName: string;
  unit: string;
  orderedQty: number;
  requiredQty: number;
};

export type RequisitionOrderHistoryRow = {
  requisitionId: string;
  requisitionCode: string;
  requestedByName: string;
  priority: RequisitionPriority;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  orderedAt: string;
  status: OrderStatus;
  receivedAt?: string | null;
  items: RequisitionOrderHistoryItem[];
};

export type VendorFulfillableItem = {
  requisitionItemId: string;
  productId: string;
  productName: string;
  unit: string;
  requiredQty: number;
  vendorPrice: number;
};

export type CreateRequisitionItemInput = {
  productId: string;
  requiredQty: number;
  notes?: string;
};

export type CreateRequisitionInput = {
  items: CreateRequisitionItemInput[];
  requiredDate?: string;
  priority: RequisitionPriority;
};
