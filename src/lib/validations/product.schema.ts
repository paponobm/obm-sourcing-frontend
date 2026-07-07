import { z } from "zod";

const vendorPriceEntrySchema = z.object({
  vendorId: z.string().min(1, "ভেন্ডর নির্বাচন করুন"),
  price: z
    .string()
    .min(1, "দাম আবশ্যক")
    .refine((val) => Number(val) > 0, "সঠিক দাম দিন"),
  rating: z.number().min(1, "রেটিং দিন").max(5),
});

export type VendorPriceEntryFormValues = z.infer<typeof vendorPriceEntrySchema>;

export const productSchema = z.object({
  sku: z.string().min(1, "SKU আবশ্যক"),
  name: z.string().min(2, "প্রোডাক্টের নাম আবশ্যক"),
  unit: z.string().min(1, "ইউনিট আবশ্যক (যেমন: কেজি)"),
  categoryId: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
  vendorPrices: z.array(vendorPriceEntrySchema).min(1, "কমপক্ষে একটি ভেন্ডর যোগ করুন"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Product-level fields only — used when editing a product from the Products
// page, where vendor/price/rating are edited separately per vendor row.
export const productDetailsEditSchema = productSchema.omit({ vendorPrices: true });

export type ProductDetailsEditFormValues = z.infer<typeof productDetailsEditSchema>;

// Used when editing one vendor's price+rating for a product from within that
// vendor's own page, where the vendor is already fixed by context.
export const vendorProductEditSchema = vendorPriceEntrySchema.omit({ vendorId: true });

export type VendorProductEditFormValues = z.infer<typeof vendorProductEditSchema>;
