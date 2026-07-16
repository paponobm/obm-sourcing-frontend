import { z } from "zod";

export const courierSchema = z.object({
  name: z.string().min(1, "কুরিয়ারের নাম আবশ্যক"),
  primaryMobile: z.string().min(1, "প্রাইমারি মোবাইল নম্বর আবশ্যক"),
  location: z.string().min(1, "লোকেশন আবশ্যক"),
});

export type CourierFormValues = z.infer<typeof courierSchema>;
