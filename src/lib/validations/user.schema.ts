import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "নাম আবশ্যক"),
  phone: z.string().regex(/^01[0-9]{9}$/, "সঠিক ফোন নাম্বার দিন (01XXXXXXXXX)"),
  email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে"),
  role: z.enum(["SUPER_ADMIN", "MANAGER", "VIEWER"], { required_error: "রোল নির্বাচন করুন" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
