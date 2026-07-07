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

export type CreateUserInput = {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  status?: "ACTIVE" | "INACTIVE";
};

export type Role = {
  id: string;
  name: UserRole;
  description?: string;
};
