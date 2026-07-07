import type { User } from "./user.types";

export type LoginInput = {
  identifier: string; // phone or email
  password: string;
  deviceId?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

/**
 * Login from a recognized device returns tokens directly. From an
 * unrecognized device, it instead returns a challengeId — the OTP itself is
 * emailed to the Super Admin, who relays it to the user out-of-band.
 */
export type LoginResult =
  | ({ otpRequired: false } & AuthTokens)
  | { otpRequired: true; challengeId: string; message: string };

export type VerifyOtpInput = {
  challengeId: string;
  code: string;
  deviceId: string;
};
