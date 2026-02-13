import { z } from "zod";

export const categoryOptionSchema = z.object({
  name: z.string().min(1, "Category is required"),
  categoryName: z.string(),
  active: z.boolean(),
  description: z.string().optional(),
});

export const activityFormSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  category: categoryOptionSchema,
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

const FILE_SIZE = 1000 * 1024; // 1MB
const SUPPORTED_FORMATS = ["application/json"];

export const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= FILE_SIZE, "File too large")
  .refine((file) => SUPPORTED_FORMATS.includes(file.type), "Unsupported format")
  .nullable()
  .refine((file): file is File => file !== null, "File is required");

export const dateSchema = z.date({ required_error: "Date is required" });
