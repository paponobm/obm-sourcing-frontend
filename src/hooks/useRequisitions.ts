"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requisitionService } from "@/services/requisition.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateRequisitionInput } from "@/types/requisition.types";

const REQUISITIONS_KEY = ["requisitions"] as const;

export function usePendingRequisitions() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "pending"],
    queryFn: () => requisitionService.listPending(),
  });
}

/** Drives the sidebar's pending-requisition count badge — shares the same
 * query key as `usePendingRequisitions`, so it's kept in sync for free by the
 * mutations below invalidating that key, with no extra network round-trip
 * when both are mounted at once. `enabled` lets callers that render this for
 * every nav item (only one of which needs it) skip the fetch entirely rather
 * than issuing redundant disabled queries. */
export function usePendingRequisitionsCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "pending"],
    queryFn: () => requisitionService.listPending(),
    select: (data) => data.length,
    enabled: options?.enabled ?? true,
  });
}

export function useConfirmedRequisitions() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "confirmed"],
    queryFn: () => requisitionService.listConfirmed(),
  });
}

export function useCancelledRequisitions() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "cancelled"],
    queryFn: () => requisitionService.listCancelled(),
  });
}

export function useRequisitionOrderHistory() {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, "order-history"],
    queryFn: () => requisitionService.listOrderHistory(),
  });
}

export function useRequisition(id: string | undefined) {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, id],
    queryFn: () => requisitionService.getById(id!),
    enabled: !!id,
  });
}

export function useRequisitionActivityLogs(id: string | undefined) {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, id, "activity-logs"],
    queryFn: () => requisitionService.getActivityLogs(id!),
    enabled: !!id,
  });
}

/** Only this requisition's still-unfulfilled items which `vendorId` sells —
 * powers OrderCreatePanel's prefill when creating an order from a Confirmed
 * requisition's vendor chip. */
export function useRequisitionVendorItems(requisitionId: string | undefined, vendorId: string | undefined) {
  return useQuery({
    queryKey: [...REQUISITIONS_KEY, requisitionId, "vendor-items", vendorId],
    queryFn: () => requisitionService.getVendorItems(requisitionId!, vendorId!),
    enabled: !!requisitionId && !!vendorId,
  });
}

function invalidateAllLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: REQUISITIONS_KEY });
  // Vendor Details' per-product pending-requisition badge is derived from
  // this same data, so it needs refreshing too.
  queryClient.invalidateQueries({ queryKey: ["vendors"] });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequisitionInput) => requisitionService.create(input),
    onSuccess: () => {
      invalidateAllLists(queryClient);
      toast.success("রিকুইজিশন তৈরি করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন তৈরি করা যায়নি")),
  });
}

export function useUpdateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateRequisitionInput> }) =>
      requisitionService.update(id, input),
    onSuccess: () => {
      invalidateAllLists(queryClient);
      toast.success("রিকুইজিশন আপডেট করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন আপডেট করা যায়নি")),
  });
}

export function useConfirmRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requisitionService.confirm(id),
    onSuccess: () => {
      invalidateAllLists(queryClient);
      toast.success("রিকুইজিশন কনফার্ম করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন কনফার্ম করা যায়নি")),
  });
}

export function useCancelRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => requisitionService.cancel(id, reason),
    onSuccess: () => {
      invalidateAllLists(queryClient);
      toast.success("রিকুইজিশন বাতিল করা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "রিকুইজিশন বাতিল করা যায়নি")),
  });
}
