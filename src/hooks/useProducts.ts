"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService, type ProductSortColumn } from "@/services/product.service";
import type { ListQuery } from "@/utils/pagination";
import type { CreateProductInput } from "@/types/product.types";

const PRODUCTS_KEY = ["products"] as const;

export function useProducts(query: ListQuery<ProductSortColumn>) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", query],
    queryFn: () => productService.list(query),
    placeholderData: (prev) => prev,
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
    onError: () => toast.error("প্রোডাক্ট সংরক্ষণ করা যায়নি"),
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
      queryClient.invalidateQueries({ queryKey: ["price-comparison"] });
      toast.success("প্রোডাক্ট আপডেট করা হয়েছে");
    },
    onError: () => toast.error("প্রোডাক্ট আপডেট করা যায়নি"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["price-comparison"] });
      toast.success("প্রোডাক্ট মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("প্রোডাক্ট মুছে ফেলা যায়নি"),
  });
}
