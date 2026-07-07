"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import type { ListQuery } from "@/utils/pagination";
import type { CreateUserInput, UpdateUserInput } from "@/types/user.types";

const USERS_KEY = ["users"] as const;

export function useUsers(query: ListQuery = {}) {
  return useQuery({
    queryKey: [...USERS_KEY, "list", query],
    queryFn: () => userService.list(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("ইউজার তৈরি করা হয়েছে");
    },
    onError: () => toast.error("ইউজার তৈরি করা যায়নি"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => userService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("ইউজার আপডেট করা হয়েছে");
    },
    onError: () => toast.error("ইউজার আপডেট করা যায়নি"),
  });
}
