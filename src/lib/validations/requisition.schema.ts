import { z } from "zod";

const requisitionItemSchema = z.object({
  productId: z.string().min(1, "প্রোডাক্ট নির্বাচন করুন"),
  requiredQty: z
    .string()
    .min(1, "প্রয়োজনীয় পরিমাণ আবশ্যক")
    .refine((val) => Number(val) > 0, "সঠিক পরিমাণ দিন"),
  notes: z.string().optional(),
});

export const requisitionSchema = z.object({
  items: z.array(requisitionItemSchema).min(1, "কমপক্ষে একটি প্রোডাক্ট যোগ করুন"),
  requiredDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type RequisitionItemFormValues = z.infer<typeof requisitionItemSchema>;
export type RequisitionFormValues = z.infer<typeof requisitionSchema>;
