import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "প্রোডাক্টের নাম আবশ্যক"),
  unit: z.string().min(1, "ইউনিট আবশ্যক (যেমন: কেজি)"),
  category: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
