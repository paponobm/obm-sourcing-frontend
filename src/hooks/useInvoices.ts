"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoiceService } from "@/services/invoice.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateInvoiceInput, ReceiveCheckInput } from "@/types/invoice.types";

const INVOICES_KEY = ["invoices"] as const;

export function useVendorInvoices(vendorId: string) {
  return useQuery({
    queryKey: [...INVOICES_KEY, "vendor", vendorId],
    queryFn: () => invoiceService.listForVendor(vendorId),
    enabled: Boolean(vendorId),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...INVOICES_KEY, id],
    queryFn: () => invoiceService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice(vendorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoiceService.createForVendor(vendorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, "vendor", vendorId] });
      // A new order changes which vendor is "most recently ordered from" for
      // every product on it — the Product List's recommended-vendor/price
      // range must refetch so it reflects this immediately, no manual reload.
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("অর্ডার তৈরি করা হয়েছে — ইনভয়েস তৈরি হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "অর্ডার তৈরি করা যায়নি")),
  });
}

export function useMarkReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceService.markReceived(id),
    onSuccess: async (invoice, id) => {
      // Awaited so callers that navigate straight to the Warehouse Receive Check
      // screen right after this resolves never render a stale (still "পেন্ডিং") status.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, id] }),
        queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, "vendor", invoice.vendorId] }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "স্ট্যাটাস আপডেট করা যায়নি")),
  });
}

export function useReceiveCheck(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReceiveCheckInput) => invoiceService.receiveCheck(id, input),
    onSuccess: (invoice, variables) => {
      queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, "vendor", invoice.vendorId] });
      if (variables.mode === "draft") {
        toast.success("ড্রাফট হিসেবে সংরক্ষণ করা হয়েছে");
      } else if (invoice.status === "DISCREPANCY") {
        toast.warning("ডিসক্রেপান্সি নোট করে সংরক্ষণ করা হয়েছে");
      } else {
        toast.success("সব মিলেছে — ইনভয়েস ক্লোজ করা হয়েছে");
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিসিভ চেক সংরক্ষণ করা যায়নি")),
  });
}
