import { z } from "zod";

export const categoryOptionSchema = z.object({
  name: z.string().min(1, "Category is required"),
  categoryName: z.string(),
  categoryId: z.string().min(1, "Category ID is required"),
  active: z.boolean(),
});

export const activityFormSchema = z.object({
  date: z.date({ error: "Date is required" }),
  category: categoryOptionSchema,
});

export const detailedActivityFormSchema = activityFormSchema.extend({
  intensity: z.string(),
  timeSpent: z.string(),
  description: z.string(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type DetailedActivityFormValues = z.infer<
  typeof detailedActivityFormSchema
>;

const FILE_SIZE = 1000 * 1024; // 1MB
const SUPPORTED_FORMATS = ["application/json"];

export const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= FILE_SIZE, "File too large")
  .refine((file) => SUPPORTED_FORMATS.includes(file.type), "Unsupported format")
  .nullable()
  .refine((file): file is File => file !== null, "File is required");

export const dateSchema = z.date({ error: "Date is required" });
