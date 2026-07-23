"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vendorService, type VendorListQuery } from "@/services/vendor.service";
import type { CreateVendorInput, UpdateVendorInput } from "@/types/vendor.types";
import type { VendorStatus } from "@/types/common.types";

const VENDORS_KEY = ["vendors"] as const;

export function useVendors(query: VendorListQuery) {
  return useQuery({
    queryKey: [...VENDORS_KEY, "list", query],
    queryFn: () => vendorService.list(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVendorInput) => vendorService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      toast.success("ভেন্ডর সংরক্ষণ করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর সংরক্ষণ করা যায়নি"),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendorInput }) =>
      vendorService.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      queryClient.invalidateQueries({ queryKey: [...VENDORS_KEY, variables.id] });
      toast.success("ভেন্ডর আপডেট করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর আপডেট করা যায়নি"),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      toast.success("ভেন্ডর মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর মুছে ফেলা যায়নি"),
  });
}

export function useActivateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      // Reactivating a vendor can restore products it previously cascaded
      // to Inactive, so the Product List must refetch too.
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ভেন্ডর সক্রিয় করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর সক্রিয় করা যায়নি"),
  });
}

export function useDeactivateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ভেন্ডর নিষ্ক্রিয় করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর নিষ্ক্রিয় করা যায়নি"),
  });
}

export function useUpdateVendorRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) => vendorService.updateRating(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      toast.success("ভেন্ডর রেটিং আপডেট করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর রেটিং আপডেট করা যায়নি"),
  });
}

export function useSetVendorProductPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      vendorId,
      productId,
      price,
      rating,
      status,
    }: {
      vendorId: string;
      productId: string;
      price: number;
      rating: number;
      status?: VendorStatus;
    }) => vendorService.setProductPrice(vendorId, productId, price, rating, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      queryClient.invalidateQueries({ queryKey: [...VENDORS_KEY, variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ভেন্ডরের তথ্য সংরক্ষণ করা হয়েছে");
    },
    onError: () => toast.error("ভেন্ডরের দাম সংরক্ষণ করা যায়নি"),
  });
}

export function useRemoveVendorFromProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, productId }: { vendorId: string; productId: string }) =>
      vendorService.removeProduct(vendorId, productId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      queryClient.invalidateQueries({ queryKey: [...VENDORS_KEY, variables.vendorId] });
      // Removing the last vendor drops the product back to Pending, so the
      // Product List (and its own Pending tab/count) must refetch too.
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ভেন্ডর বাদ দেওয়া হয়েছে");
    },
    onError: () => toast.error("ভেন্ডর বাদ দেওয়া যায়নি"),
  });
}

export function useVendorActivityLogs(vendorId: string | undefined) {
  return useQuery({
    queryKey: [...VENDORS_KEY, "activity-logs", vendorId],
    queryFn: () => vendorService.getActivityLogs(vendorId!),
    enabled: !!vendorId,
  });
}
