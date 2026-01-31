import { z } from "zod";

export const categoryOptionSchema = z.object({
  name: z.string().min(1, "Category is required"),
  categoryName: z.string(),
  active: z.boolean(),
  description: z.string().optional(),
});

export type CategoryOptionSchema = z.infer<typeof categoryOptionSchema>;

export const activityFormSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  category: categoryOptionSchema,
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

export const dateFilterSchema = z
  .object({
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

export type DateFilterFormValues = z.infer<typeof dateFilterSchema>;

const FILE_SIZE = 1000 * 1024; // 1MB
const SUPPORTED_FORMATS = ["application/json"];

export const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= FILE_SIZE, "File too large")
  .refine((file) => SUPPORTED_FORMATS.includes(file.type), "Unsupported format")
  .nullable()
  .refine((file): file is File => file !== null, "File is required");

export type FileSchema = z.infer<typeof fileSchema>;

export const dateSchema = z.date({ required_error: "Date is required" });

// Helper to create a TanStack Form validator from a Zod schema
export function zodFieldValidator<T>(schema: z.ZodType<T>) {
  return ({ value }: { value: T }) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return undefined;
  };
}
