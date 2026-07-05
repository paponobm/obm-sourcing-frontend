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
  createdAt: string;
};

export type VendorProductPrice = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
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
};

export type UpdateVendorInput = Partial<CreateVendorInput> & {
  status?: VendorStatus;
};
