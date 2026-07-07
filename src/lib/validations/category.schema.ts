import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "ক্যাটাগরির নাম আবশ্যক"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
