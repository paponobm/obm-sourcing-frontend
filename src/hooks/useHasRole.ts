"use client";

import { useCurrentUser } from "./useAuth";
import type { UserRole } from "@/types/user.types";

/** For hiding/disabling individual actions (buttons, columns) — not page-level gating; use RequireRole for that. */
export function useHasRole(roles: UserRole[]): boolean {
  const { data: user } = useCurrentUser();
  return Boolean(user && roles.includes(user.role));
}
