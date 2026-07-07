"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/user.types";

/**
 * Client-side UX gate mirroring the backend's @Roles() guards — real
 * enforcement always happens server-side; this just avoids showing/letting
 * users navigate into pages their role can't act on anyway.
 */
export function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();
  const allowed = Boolean(user && roles.includes(user.role));

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      toast.error("আপনার এই পাতা দেখার অনুমতি নেই");
      router.replace(ROUTES.dashboard);
    }
  }, [isLoading, user, allowed, router]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
