import { z } from "zod";

export const requisitionSchema = z.object({
  productId: z.string().min(1, "প্রোডাক্ট নির্বাচন করুন"),
  requiredQty: z
    .string()
    .min(1, "প্রয়োজনীয় পরিমাণ আবশ্যক")
    .refine((val) => Number(val) > 0, "সঠিক পরিমাণ দিন"),
  unit: z.string().min(1, "ইউনিট আবশ্যক"),
  requiredDate: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type RequisitionFormValues = z.infer<typeof requisitionSchema>;
