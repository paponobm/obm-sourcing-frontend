import type { VendorStatus } from "./common.types";

export type Courier = {
  id: string;
  name: string;
  primaryMobile: string;
  additionalMobiles: string[];
  location: string;
  logoUrl?: string;
  status: VendorStatus;
  createdAt: string;
};

export type CreateCourierInput = {
  name: string;
  primaryMobile: string;
  additionalMobiles?: string[];
  location: string;
  logoUrl?: string;
};

// Deliberately no `status` field — a courier's status only changes via the
// dedicated activate/deactivate actions, never through a generic profile edit.
export type UpdateCourierInput = Partial<CreateCourierInput>;
