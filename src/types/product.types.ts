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
  thumbnailUrl?: string;
  imageUrls: string[];
  vendorCount: number;
  lowestPrice: number;
  createdAt: string;
  /** Every vendor supplying this product, sorted by price ascending. */
  vendors: ProductVendorEntry[];
};

export type CreateProductInput = {
  sku: string;
  name: string;
  unit: string;
  categoryId: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
};

export type VendorPriceInput = {
  vendorId: string;
  price: number;
  rating: number;
};
