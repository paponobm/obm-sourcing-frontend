import type { VendorStatus } from "@/types/common.types";

export const VENDOR_STATUS_LABEL_BN: Record<VendorStatus, string> = {
  ACTIVE: "অ্যাক্টিভ",
  INACTIVE: "ইনঅ্যাক্টিভ",
};

export function vendorStatusBadgeVariant(status: VendorStatus): "active" | "inactive" {
  return status === "ACTIVE" ? "active" : "inactive";
}
