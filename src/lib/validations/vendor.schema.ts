import { z } from "zod";

export const vendorSchema = z.object({
  shopName: z.string().min(2, "দোকানের নাম আবশ্যক"),
  contactPerson: z.string().min(2, "যোগাযোগ ব্যক্তির নাম আবশ্যক"),
  address: z.string().min(3, "ঠিকানা আবশ্যক"),
  whatsapp: z.string().regex(/^01[0-9]{9}$/, "সঠিক হোয়াটসঅ্যাপ নাম্বার দিন (01XXXXXXXXX)"),
  phone: z.string().regex(/^01[0-9]{9}$/, "সঠিক ফোন নাম্বার দিন (01XXXXXXXXX)"),
  note: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
