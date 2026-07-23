import type { VendorStatus } from "./common.types";

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  status: VendorStatus;
  productCount: number;
  /** How many of this category's products are currently ACTIVE — must be
   * zero before the category itself can be deactivated. */
  activeProductCount: number;
  createdAt: string;
};

export type CategoryListQuery = {
  search?: string;
  statusFilter?: "active" | "inactive" | "all";
};

export type CreateCategoryInput = {
  name: string;
  imageUrl?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
