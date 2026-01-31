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

/**
 * Extract the first error message from form-level error map (Standard Schema format).
 * Form-level errors from Standard Schema are structured as Record<string, StandardSchemaV1Issue[]>
 */
export function getFormErrorMessage(
  errorMap: Record<string, StandardSchemaV1Issue[]> | undefined
): string | undefined {
  if (!errorMap) return undefined;
  const firstKey = Object.keys(errorMap)[0];
  if (!firstKey) return undefined;
  const issues = errorMap[firstKey];
  return issues?.[0]?.message;
}
