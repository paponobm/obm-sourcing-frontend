export type ProductStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED";

export type ProductVendorEntry = {
  vendorId: string;
  vendorName: string;
  price: number;
  rating: number;
  lastUpdatedAt: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  categoryId: string;
  categoryName: string;
  description?: string | null;
  thumbnailUrl?: string;
  imageUrls: string[];
  status: ProductStatus;
  preferredVendorId?: string | null;
  vendorCount: number;
  lowestPrice: number;
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
  description?: string | null;
  thumbnailUrl?: string;
  imageUrls: string[];
  categoryId: string;
  categoryName: string;
  createdByName: string;
  createdAt: string;
  status: ProductStatus;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  unit: string;
  categoryId: string;
  description?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
};

export type VendorPriceInput = {
  vendorId: string;
  price: number;
  rating: number;
};

/** Admin can correct the Manager's submitted fields as part of the same
 * approve action — all optional, so approving unchanged still works. */
export type ApproveProductInput = {
  name?: string;
  sku?: string;
  unit?: string;
  categoryId?: string;
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
  | "UNIT_CHANGED";

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
