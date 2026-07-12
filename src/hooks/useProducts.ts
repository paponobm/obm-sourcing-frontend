"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService, type ProductListQuery } from "@/services/product.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateProductInput, ApproveProductInput, RejectProductInput } from "@/types/product.types";

const PRODUCTS_KEY = ["products"] as const;

export function useProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", query],
    queryFn: () => productService.list(query),
    placeholderData: (prev) => prev,
  });
}

export function usePendingProducts() {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "pending"],
    queryFn: () => productService.listPending(),
  });
}

/** Drives the Pending Products tab's badge count — shares the same query key
 * as `usePendingProducts`, so it's kept in sync for free by the
 * approve/reject mutations below invalidating that key. */
export function usePendingProductsCount() {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "pending"],
    queryFn: () => productService.listPending(),
    select: (data) => data.length,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("প্রোডাক্ট সংরক্ষণ করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট সংরক্ষণ করা যায়নি")),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateProductInput> }) =>
      productService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("প্রোডাক্ট আপডেট করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট আপডেট করা যায়নি")),
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveProductInput }) => productService.approve(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("প্রোডাক্ট অনুমোদন করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট অনুমোদন করা যায়নি")),
  });
}

export function useRejectProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectProductInput }) => productService.reject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("প্রোডাক্ট প্রত্যাখ্যান করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট প্রত্যাখ্যান করা যায়নি")),
  });
}

export function useActivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("প্রোডাক্ট সক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট সক্রিয় করা যায়নি")),
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("প্রোডাক্ট নিষ্ক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রোডাক্ট নিষ্ক্রিয় করা যায়নি")),
  });
}

export function useSetPreferredVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vendorId }: { id: string; vendorId: string }) => productService.setPreferredVendor(id, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("প্রেফার্ড ভেন্ডর পরিবর্তন করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "প্রেফার্ড ভেন্ডর পরিবর্তন করা যায়নি")),
  });
}
