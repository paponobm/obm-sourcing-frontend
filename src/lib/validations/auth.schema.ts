import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "ইমেইল বা ফোন নাম্বার আবশ্যক")
    .refine(
      (val) => /^01[0-9]{9}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "সঠিক ইমেইল বা ফোন নাম্বার (01XXXXXXXXX) দিন",
    ),
  password: z.string().min(4, "পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, "৬ সংখ্যার কোড দিন").regex(/^\d{6}$/, "শুধু সংখ্যা দিন"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
