export type OrderStatus = "IN_TRANSIT" | "CONFIRMED" | "RECEIVED" | "DISCREPANCY" | "VERIFIED" | "CLOSED";

export type PaymentStatus = "PAID" | "UNPAID";

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  orderedAt: string;
  itemCount: number;
  totalAmount: number;
  procurementCost: number | null;
  status: OrderStatus;
  orderedByName: string;
  updatedAt: string;
};

export type InvoiceItem = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  priceAtOrder: number;
  orderedQty: number;
  receivedQty: number | null;
  lineTotal: number;
  remark?: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  status: OrderStatus;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  vendorAddress: string;
  vendorPhone: string;
  // Null until set — optionally via "Order Confirm করুন" (a plain status
  // change, Pending -> Confirmed) or directly on the Warehouse Receive page,
  // the only place any of this is ever mandatory.
  courierId: string | null;
  courierName: string | null;
  courierPrimaryMobile: string | null;
  courierLocation: string | null;
  orderedByName: string;
  orderedAt: string;
  receivedAt?: string | null;
  closedAt?: string | null;
  totalAmount: number;
  laborCost: number | null;
  courierCost: number | null;
  // A Manager's own proposed additional cost, awaiting Super Admin's
  // Approve & Close — not yet folded into laborCost/courierCost above.
  managerLaborCost?: number | null;
  managerCourierCost?: number | null;
  paymentStatus: PaymentStatus | null;
  procurementCost: number | null;
  items: InvoiceItem[];
  // Set once a Manager's own matched receive-check moves the invoice to
  // VERIFIED — null for an invoice a Super Admin closed directly.
  verifiedAt?: string | null;
  verifiedByName?: string | null;
  // Set once Super Admin's Approve & Close action finalizes a VERIFIED
  // invoice to CLOSED.
  approvedByName?: string | null;
  notes?: string | null;
};

// Step 1 — creates a Pending order with no procurement info at all.
export type CreateInvoiceInput = {
  items: { productId: string; orderedQty: number; requisitionItemId?: string }[];
};

// Step 2 — Pending -> Confirmed. All four fields are mandatory to confirm —
// confirming locks in the procurement info right then.
export type ConfirmOrderInput = {
  courierId: string;
  paymentStatus: PaymentStatus;
  laborCost: number;
  courierCost: number;
};

export type ReceiveCheckInput = {
  mode: "draft" | "final";
  items: { itemId: string; receivedQty: number; remark?: string }[];
  courierId: string;
  laborCost?: number;
  courierCost?: number;
  paymentStatus?: PaymentStatus;
};
