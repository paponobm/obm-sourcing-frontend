import type { UserRole } from "@/types/user.types";

export const ROLE_LABEL_BN: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

/** Mirrors the backend's @Roles() guards — kept here so the UI can hide/gate to match. */
export const MANAGE_CATALOG_ROLES: UserRole[] = ["SUPER_ADMIN", "MANAGER"];
export const SUPER_ADMIN_ONLY: UserRole[] = ["SUPER_ADMIN"];
