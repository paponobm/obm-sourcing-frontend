"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requisitionService } from "@/services/requisition.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateRequisitionInput, ConvertRequisitionInput } from "@/types/requisition.types";

const REQUISITIONS_KEY = ["requisitions"] as const;

export function usePendingRequisitions() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "pending"],
    queryFn: () => requisitionService.listPending(),
  });
}

/** Drives the sidebar's pending-requisition count badge — shares the same
 * query key as `usePendingRequisitions`, so it's kept in sync for free by the
 * create/convert/cancel mutations below invalidating that key, with no extra
 * network round-trip when both are mounted at once. `enabled` lets callers
 * that render this for every nav item (only one of which needs it) skip the
 * fetch entirely rather than issuing redundant disabled queries. */
export function usePendingRequisitionsCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "pending"],
    queryFn: () => requisitionService.listPending(),
    select: (data) => data.length,
    enabled: options?.enabled ?? true,
  });
}

export function useCompletedRequisitions() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "completed"],
    queryFn: () => requisitionService.listCompleted(),
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequisitionInput) => requisitionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REQUISITIONS_KEY, "pending"] });
      toast.success("রিকুইজিশন তৈরি করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন তৈরি করা যায়নি")),
  });
}

export function useConvertRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConvertRequisitionInput }) =>
      requisitionService.convert(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REQUISITIONS_KEY, "pending"] });
      queryClient.invalidateQueries({ queryKey: [...REQUISITIONS_KEY, "completed"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন আপডেট করা যায়নি")),
  });
}

export function useCancelRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requisitionService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REQUISITIONS_KEY, "pending"] });
      toast.success("রিকুইজিশন বাতিল করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন বাতিল করা যায়নি")),
  });
}
