import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "প্রোডাক্টের নাম আবশ্যক"),
  unit: z.string().min(1, "ইউনিট আবশ্যক (যেমন: কেজি)"),
  category: z.string().optional(),
  vendorId: z.string().min(1, "ভেন্ডর নির্বাচন করুন"),
  price: z
    .string()
    .min(1, "দাম আবশ্যক")
    .refine((val) => Number(val) > 0, "সঠিক দাম দিন"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Used when editing a product from within a vendor's page, where the vendor
// is already fixed by context and isn't re-selectable.
export const productEditSchema = productSchema.omit({ vendorId: true });

export type ProductEditFormValues = z.infer<typeof productEditSchema>;
