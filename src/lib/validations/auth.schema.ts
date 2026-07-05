import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "ফোন নাম্বার বা ইমেইল আবশ্যক")
    .refine(
      (val) => /^01[0-9]{9}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "সঠিক ফোন নাম্বার (01XXXXXXXXX) বা ইমেইল দিন",
    ),
  password: z.string().min(4, "পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
