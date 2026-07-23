"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/services/category.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CategoryListQuery, CreateCategoryInput, UpdateCategoryInput } from "@/types/category.types";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories(query: CategoryListQuery = {}) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, query],
    queryFn: () => categoryService.list(query),
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("ক্যাটাগরি তৈরি করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ক্যাটাগরি তৈরি করা যায়নি")),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoryService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ক্যাটাগরি আপডেট করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ক্যাটাগরি আপডেট করা যায়নি")),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ক্যাটাগরি মুছে ফেলা যায়নি")),
  });
}

export function useActivateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("ক্যাটাগরি সক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ক্যাটাগরি সক্রিয় করা যায়নি")),
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("ক্যাটাগরি নিষ্ক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ক্যাটাগরি নিষ্ক্রিয় করা যায়নি")),
  });
}
