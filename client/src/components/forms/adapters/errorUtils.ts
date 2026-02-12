import type { StandardSchemaV1Issue } from "@tanstack/react-form";

/**
 * Extract the first error message as a string from the field errors array.
 */
export function getErrorMessage(
  errors: (StandardSchemaV1Issue | string | undefined)[] | undefined
): string | undefined {
  const error = errors?.[0];
  if (!error) return undefined;
  if (typeof error === "string") return error;
  return error.message;
}
