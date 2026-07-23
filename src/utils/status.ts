import type { VendorStatus } from "@/types/common.types";
import type { OrderStatus, PaymentStatus } from "@/types/invoice.types";
import type { RequisitionPriority, RequisitionStatus } from "@/types/requisition.types";
import type { ProductActivityActionType, ProductStatus } from "@/types/product.types";

export const VENDOR_STATUS_LABEL_BN: Record<VendorStatus, string> = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const PAYMENT_STATUS_LABEL_BN: Record<PaymentStatus, string> = {
  PAID: "PAID",
  UNPAID: "DUE",
};

export function vendorStatusBadgeVariant(status: VendorStatus): "statusActive" | "statusInactive" {
  return status === "ACTIVE" ? "statusActive" : "statusInactive";
}

export const PRODUCT_STATUS_LABEL_BN: Record<ProductStatus, string> = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "পেন্ডিং",
  REJECTED: "প্রত্যাখ্যাত",
};

export function productStatusBadgeVariant(
  status: ProductStatus,
): "statusActive" | "statusInactive" | "pending" | "destructive" {
  switch (status) {
    case "ACTIVE":
      return "statusActive";
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "destructive";
    case "INACTIVE":
    default:
      return "statusInactive";
  }
}

export const PRODUCT_ACTIVITY_ACTION_LABEL_BN: Record<ProductActivityActionType, string> = {
  PRICE_CHANGED: "দাম পরিবর্তন",
  VENDOR_ADDED: "ভেন্ডর যোগ",
  VENDOR_REMOVED: "ভেন্ডর বাদ",
  STATUS_CHANGED: "স্ট্যাটাস পরিবর্তন",
  APPROVED: "অনুমোদিত",
  REJECTED: "প্রত্যাখ্যাত",
  CATEGORY_CHANGED: "ক্যাটাগরি পরিবর্তন",
  IMAGE_CHANGED: "ছবি পরিবর্তন",
  NAME_CHANGED: "নাম পরিবর্তন",
  UNIT_CHANGED: "ইউনিট পরিবর্তন",
  RATING_CHANGED: "রেটিং পরিবর্তন",
  VENDOR_STATUS_CHANGED: "ভেন্ডরের স্ট্যাটাস পরিবর্তন",
  ORDER_CREATED: "অর্ডার তৈরি",
  REQUISITION_RECEIVED: "রিকুইজিশন গৃহীত",
  VENDOR_RATING_CHANGED: "ভেন্ডর রেটিং পরিবর্তন",
  REQUISITION_ITEM_ADDED: "রিকুইজিশনে প্রোডাক্ট যোগ",
  REQUISITION_ITEM_REMOVED: "রিকুইজিশন থেকে প্রোডাক্ট বাদ",
  REQUISITION_ITEM_QTY_CHANGED: "পরিমাণ পরিবর্তন",
  REQUISITION_CONFIRMED: "রিকুইজিশন কনফার্ম",
  REQUISITION_CANCELLED: "রিকুইজিশন বাতিল",
};

export const ORDER_STATUS_LABEL_BN: Record<OrderStatus, string> = {
  IN_TRANSIT: "পেন্ডিং",
  CONFIRMED: "পথে আছে",
  RECEIVED: "রিসিভড",
  DISCREPANCY: "পণ্যের অমিল",
  VERIFIED: "ভেরিফায়েড",
  CLOSED: "ক্লোজড",
};

export function orderStatusBadgeVariant(
  status: OrderStatus,
): "pending" | "orderOnTheWay" | "orderReceived" | "orderVerified" | "orderClosed" | "orderDiscrepancy" {
  switch (status) {
    case "IN_TRANSIT":
      return "pending";
    case "CONFIRMED":
      return "orderOnTheWay";
    case "RECEIVED":
      return "orderReceived";
    case "VERIFIED":
      return "orderVerified";
    case "CLOSED":
      return "orderClosed";
    case "DISCREPANCY":
      return "orderDiscrepancy";
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
  CONFIRMED: "কনফার্মড",
  ORDERED: "অর্ডার করা হয়েছে",
  CANCELLED: "বাতিল",
};
