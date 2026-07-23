"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unitService } from "@/services/unit.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { UnitListQuery, CreateUnitInput, UpdateUnitInput } from "@/types/unit.types";

const UNITS_KEY = ["units"] as const;

export function useUnits(query: UnitListQuery = {}) {
  return useQuery({
    queryKey: [...UNITS_KEY, query],
    queryFn: () => unitService.list(query),
    staleTime: 60 * 1000,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUnitInput) => unitService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
      toast.success("ইউনিট তৈরি করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ইউনিট তৈরি করা যায়নি")),
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUnitInput }) => unitService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ইউনিট আপডেট করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ইউনিট আপডেট করা যায়নি")),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
      toast.success("ইউনিট মুছে ফেলা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ইউনিট মুছে ফেলা যায়নি")),
  });
}

export function useActivateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
      toast.success("ইউনিট সক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ইউনিট সক্রিয় করা যায়নি")),
  });
}

export function useDeactivateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY });
      toast.success("ইউনিট নিষ্ক্রিয় করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ইউনিট নিষ্ক্রিয় করা যায়নি")),
  });
}
