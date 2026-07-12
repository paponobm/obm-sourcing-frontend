export type OrderStatus = "IN_TRANSIT" | "RECEIVED" | "DISCREPANCY" | "VERIFIED" | "CLOSED";

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  orderedAt: string;
  itemCount: number;
  totalAmount: number;
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
  orderedByName: string;
  orderedAt: string;
  closedAt?: string | null;
  totalAmount: number;
  items: InvoiceItem[];
  // Not yet populated by the backend (no verifier/notes tracking on Invoice
  // yet) — declared here so ClosedInvoiceSection can render them once it is.
  verifiedByName?: string | null;
  notes?: string | null;
};

export type CreateInvoiceInput = {
  items: { productId: string; orderedQty: number }[];
};

export type ReceiveCheckInput = {
  mode: "draft" | "final";
  items: { itemId: string; receivedQty: number; remark?: string }[];
};
