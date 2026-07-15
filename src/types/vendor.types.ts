import type { VendorStatus } from "./common.types";
import type { ProductActivityActionType, ProductStatus } from "./product.types";

export type Vendor = {
  id: string;
  vendorCode: string; // e.g. "VN-0032"
  shopName: string;
  address: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  status: VendorStatus;
  productCount: number;
  note?: string;
  imageUrl?: string;
  /** Overall admin-set vendor rating (1-5), distinct from VendorProductPrice.rating
   * (a per-product price/quality rating) — directly editable on the Profile tab. */
  rating: number;
  createdAt: string;
  /** Number of this vendor's own products that currently have at least one
   * still-unfulfilled CONFIRMED requisition (never Pending or Cancelled) —
   * drives the Vendor List's "পেন্ডিং (N)" badge. */
  pendingRequisitionCount: number;
  pendingRequisitions: VendorPendingRequisitionItem[];
};

export type VendorPendingRequisitionItem = {
  productId: string;
  productName: string;
  unit: string;
  totalQty: number;
};

/** One still-unfulfilled CONFIRMED requisition (never Pending — not yet
 * reviewed, so not real demand — and never Cancelled) that wants this
 * product. `requiredQty × the vendor row's own current price` is computed
 * client-side (in the tooltip) for "Required Amount", so it always reflects
 * whatever price is currently loaded rather than a stale stored figure. */
export type ConfirmedRequisitionEntry = {
  requisitionId: string;
  requisitionCode: string;
  requiredQty: number;
  createdAt: string;
  requestedByName: string;
};

export type VendorProductPrice = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  price: number;
  rating: number;
  isLowestForProduct: boolean;
  lastUpdatedAt: string;
  /** Lets the frontend exclude Inactive products from New Order/requisition
   * pickers without changing what this list itself displays. */
  productStatus: ProductStatus;
  /** Requisitions have no vendor of their own (only chosen at conversion),
   * so this reflects pending demand for the PRODUCT — the same figures show
   * on every vendor's row selling it. Count/list only ever include CONFIRMED
   * requisitions — see ConfirmedRequisitionEntry. */
  pendingRequisitionCount: number;
  confirmedRequisitions: ConfirmedRequisitionEntry[];
};

export type VendorWithProducts = Vendor & {
  products: VendorProductPrice[];
};

export type CreateVendorInput = {
  shopName: string;
  contactPerson: string;
  address: string;
  whatsapp: string;
  phone: string;
  note?: string;
  imageUrl?: string;
};

// Deliberately no `status` field — a vendor's status only changes via the
// dedicated activate/deactivate actions (useActivateVendor/useDeactivateVendor),
// never through a generic profile edit.
export type UpdateVendorInput = Partial<CreateVendorInput>;

/** Same shape as ProductActivityLog, but spans every product this vendor
 * supplies, so each entry also names its own product. */
export type VendorActivityLog = {
  id: string;
  actionType: ProductActivityActionType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  description: string;
  performedByName: string;
  performedByRole: string;
  createdAt: string;
  /** Null for vendor-only entries not about any single product (e.g.
   * VENDOR_RATING_CHANGED). */
  productId: string | null;
  productName: string | null;
};
