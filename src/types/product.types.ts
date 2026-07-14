import type { VendorStatus } from "./common.types";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED";

export type ProductVendorEntry = {
  vendorId: string;
  vendorName: string;
  price: number;
  rating: number;
  /** The vendor's own global active/inactive status — not scoped to this product. */
  status: VendorStatus;
  lastUpdatedAt: string;
  /** How many times this vendor has been ordered for this product. */
  totalOrderCount: number;
  /** Most recent order date for this vendor+product pair, or null if never ordered. */
  lastOrderedDate: string | null;
};

export type ProductCategoryRef = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  unitId: string;
  categories: ProductCategoryRef[];
  description?: string | null;
  thumbnailUrl?: string;
  imageUrls: string[];
  status: ProductStatus;
  vendorCount: number;
  lowestPrice: number;
  highestPrice: number;
  /** Last-ordered vendor if this product has order history, else the lowest-priced vendor. */
  recommendedVendorId: string | null;
  createdAt: string;
  /** Every vendor supplying this product, sorted by price ascending. */
  vendors: ProductVendorEntry[];
};

/** A Manager's product submission awaiting Admin approval — never has
 * vendor/price data, since that's only assignable on approval. */
export type PendingProduct = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  unitId: string;
  description?: string | null;
  thumbnailUrl?: string;
  imageUrls: string[];
  categories: ProductCategoryRef[];
  createdByName: string;
  createdAt: string;
  status: ProductStatus;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  unitId: string;
  categoryIds: string[];
  description?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
};

export type VendorPriceInput = {
  vendorId: string;
  price: number;
  rating: number;
};

/** One dirty row from the Product Edit modal's Vendor Information table —
 * only vendors the admin actually changed are sent, alongside the product's
 * own fields, in a single update() call. */
export type UpdateProductVendorInput = {
  vendorId: string;
  price: number;
  rating: number;
  status?: VendorStatus;
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  vendors?: UpdateProductVendorInput[];
};

/** Admin can correct the Manager's submitted fields as part of the same
 * approve action — all optional, so approving unchanged still works. */
export type ApproveProductInput = {
  name?: string;
  sku?: string;
  unitId?: string;
  categoryIds?: string[];
  description?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  vendors: VendorPriceInput[];
};

export type RejectProductInput = {
  reason: string;
};

export type ProductActivityActionType =
  | "PRICE_CHANGED"
  | "VENDOR_ADDED"
  | "VENDOR_REMOVED"
  | "STATUS_CHANGED"
  | "APPROVED"
  | "REJECTED"
  | "CATEGORY_CHANGED"
  | "IMAGE_CHANGED"
  | "NAME_CHANGED"
  | "UNIT_CHANGED"
  | "RATING_CHANGED"
  | "VENDOR_STATUS_CHANGED"
  | "ORDER_CREATED"
  | "REQUISITION_RECEIVED";

export type ProductActivityLog = {
  id: string;
  actionType: ProductActivityActionType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  description: string;
  performedByName: string;
  performedByRole: string;
  createdAt: string;
};
