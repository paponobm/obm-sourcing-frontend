import type { VendorStatus } from "./common.types";

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

export type VendorProductPrice = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  category?: string;
  price: number;
  rating: number;
  isLowestForProduct: boolean;
  lastUpdatedAt: string;
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
