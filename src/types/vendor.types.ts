import type { VendorStatus } from "./common.types";
import type { ProductActivityActionType } from "./product.types";

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
  createdAt: string;
};

export type PendingRequisitionSummary = {
  count: number;
  totalQty: number;
  latestDate: string;
  latestRequestedByName: string;
};

export type VendorProductPrice = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
  rating: number;
  isLowestForProduct: boolean;
  lastUpdatedAt: string;
  /** Requisitions have no vendor of their own (only chosen at conversion),
   * so this reflects pending demand for the PRODUCT — the same figure shows
   * on every vendor's row selling it. */
  pendingRequisitionCount: number;
  pendingRequisitionSummary: PendingRequisitionSummary | null;
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

export type UpdateVendorInput = Partial<CreateVendorInput> & {
  status?: VendorStatus;
};

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
  productId: string;
  productName: string;
};
