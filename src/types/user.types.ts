export type UserRole = "SUPER_ADMIN" | "MANAGER" | "VIEWER";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarInitial: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};
