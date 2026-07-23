import type { VendorStatus } from "./common.types";

export type Unit = {
  id: string;
  name: string;
  status: VendorStatus;
  productCount: number;
  /** How many of this unit's products are currently ACTIVE — must be zero
   * before the unit itself can be deactivated. */
  activeProductCount: number;
  createdAt: string;
};

export type UnitListQuery = {
  search?: string;
  statusFilter?: "active" | "inactive" | "all";
};

export type CreateUnitInput = {
  name: string;
};

export type UpdateUnitInput = Partial<CreateUnitInput>;
