import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().min(1, "ইউনিটের নাম আবশ্যক"),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
