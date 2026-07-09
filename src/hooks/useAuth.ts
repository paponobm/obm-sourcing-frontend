"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { ROUTES } from "@/constants/routes";
import type { AuthTokens, LoginInput, VerifyOtpInput } from "@/types/auth.types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}

function completeLogin(
  data: AuthTokens,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
) {
  authStorage.setTokens(data.accessToken, data.refreshToken);
  queryClient.setQueryData(["auth", "me"], data.user);
  router.push(ROUTES.dashboard);
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      if (!data.otpRequired) {
        completeLogin(data, queryClient, router);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "লগইন ব্যর্থ হয়েছে");
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyOtpInput) => authService.verifyOtp(input),
    onSuccess: (data) => {
      completeLogin(data, queryClient, router);
    },
    onError: (error: Error) => {
      toast.error(error.message || "কোডটি সঠিক নয়");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidating the refresh token server-side is best-effort cleanup —
      // fired in the background so logout doesn't wait on a network round trip.
      authService.logout(authStorage.getToken()).catch(() => undefined);
    },
    onSuccess: () => {
      // Token cleared immediately — the middleware checks this cookie on every
      // navigation, so it must be gone before we push to /login or the
      // still-authenticated request would just get redirected back.
      authStorage.clear();
      router.push(ROUTES.login);
      // Cache wipe deferred one tick so the outgoing page's still-mounted
      // queries (e.g. the dashboard's) aren't still-observed-but-uncached at
      // the moment their token disappears, which would auto-refetch → 401.
      setTimeout(() => queryClient.clear(), 0);
    },
  });
}
