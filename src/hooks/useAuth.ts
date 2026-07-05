"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { ROUTES } from "@/constants/routes";
import type { LoginInput } from "@/types/auth.types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      authStorage.setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push(ROUTES.dashboard);
    },
    onError: (error: Error) => {
      toast.error(error.message || "লগইন ব্যর্থ হয়েছে");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      authStorage.clear();
      queryClient.clear();
      router.push(ROUTES.login);
    },
  });
}
