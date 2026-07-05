import type { User } from "./user.types";

export type LoginInput = {
  identifier: string; // phone or email
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
