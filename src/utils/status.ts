import type { VendorStatus } from "@/types/common.types";
import type { OrderStatus } from "@/types/invoice.types";
import type { RequisitionPriority, RequisitionStatus } from "@/types/requisition.types";

export const VENDOR_STATUS_LABEL_BN: Record<VendorStatus, string> = {
  ACTIVE: "অ্যাক্টিভ",
  INACTIVE: "ইনঅ্যাক্টিভ",
};

export function vendorStatusBadgeVariant(status: VendorStatus): "active" | "inactive" {
  return status === "ACTIVE" ? "active" : "inactive";
}

export const ORDER_STATUS_LABEL_BN: Record<OrderStatus, string> = {
  IN_TRANSIT: "পেন্ডিং",
  RECEIVED: "রিসিভড",
  DISCREPANCY: "ডিসক্রেপান্সি",
  VERIFIED: "ভেরিফায়েড",
  CLOSED: "ক্লোজড",
};

export function orderStatusBadgeVariant(status: OrderStatus): "active" | "inactive" | "low" | "destructive" {
  switch (status) {
    case "VERIFIED":
    case "CLOSED":
      return "active";
    case "DISCREPANCY":
      return "destructive";
    case "IN_TRANSIT":
    case "RECEIVED":
    default:
      return "low";
  }
}

export const REQUISITION_PRIORITY_LABEL_BN: Record<RequisitionPriority, string> = {
  LOW: "কম",
  MEDIUM: "মাঝারি",
  HIGH: "বেশি",
  URGENT: "জরুরি",
};

/** Escalating severity read using only the existing badge colors — gray → green → amber → red. */
export function requisitionPriorityBadgeVariant(
  priority: RequisitionPriority,
): "active" | "inactive" | "low" | "destructive" {
  switch (priority) {
    case "LOW":
      return "inactive";
    case "MEDIUM":
      return "active";
    case "HIGH":
      return "low";
    case "URGENT":
      return "destructive";
  }
}

export const REQUISITION_STATUS_LABEL_BN: Record<RequisitionStatus, string> = {
  PENDING: "পেন্ডিং",
  ORDERED: "অর্ডার করা হয়েছে",
  CANCELLED: "বাতিল",
};
