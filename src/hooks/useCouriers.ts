"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courierService } from "@/services/courier.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateCourierInput, UpdateCourierInput } from "@/types/courier.types";

const COURIERS_KEY = ["couriers"] as const;

export function useCouriers() {
  return useQuery({
    queryKey: COURIERS_KEY,
    queryFn: () => courierService.list(),
    staleTime: 60 * 1000,
  });
}

export function useCreateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourierInput) => courierService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURIERS_KEY });
      toast.success("কুরিয়ার তৈরি করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "কুরিয়ার তৈরি করা যায়নি")),
  });
}

export function useUpdateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourierInput }) => courierService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURIERS_KEY });
      toast.success("কুরিয়ার তথ্য আপডেট করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "কুরিয়ার তথ্য আপডেট করা যায়নি")),
  });
}

export function useActivateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courierService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURIERS_KEY });
      toast.success("কুরিয়ার সক্রিয় করা হয়েছে");
    },
    onError: () => toast.error("কুরিয়ার সক্রিয় করা যায়নি"),
  });
}

export function useDeactivateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courierService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURIERS_KEY });
      toast.success("কুরিয়ার নিষ্ক্রিয় করা হয়েছে");
    },
    onError: () => toast.error("কুরিয়ার নিষ্ক্রিয় করা যায়নি"),
  });
}
