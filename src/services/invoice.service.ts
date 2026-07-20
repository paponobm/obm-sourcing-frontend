import type {
  Invoice,
  InvoiceListItem,
  CreateInvoiceInput,
  ConfirmOrderInput,
  ReceiveCheckInput,
} from "@/types/invoice.types";
import { apiClient } from "./api-client";

export const invoiceService = {
  async listForVendor(vendorId: string): Promise<InvoiceListItem[]> {
    return apiClient.get<InvoiceListItem[]>(`/invoices/vendor/${vendorId}`).then((r) => r.data);
  },

  async createForVendor(vendorId: string, input: CreateInvoiceInput): Promise<Invoice> {
    return apiClient.post<Invoice>(`/invoices/vendor/${vendorId}`, input).then((r) => r.data);
  },

  async getById(id: string): Promise<Invoice | undefined> {
    return apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data);
  },

  async confirmOrder(id: string, input: ConfirmOrderInput): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}/confirm-order`, input).then((r) => r.data);
  },

  async markReceived(id: string): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}/mark-received`).then((r) => r.data);
  },

  async receiveCheck(id: string, input: ReceiveCheckInput): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}/receive-check`, input).then((r) => r.data);
  },
};
