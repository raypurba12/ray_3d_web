import { ApiError } from "../../../lib/api";
import type { ServerIssue } from "../../../types/admin";

export const toFieldErrors = (
  issues: ServerIssue[] | undefined,
  fields: ReadonlySet<string>
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const issue of issues ?? []) {
    const key = issue.path?.find(
      (part): part is string => typeof part === "string"
    );
    if (!key || !fields.has(key) || result[key]) continue;
    result[key] = issue.message ?? "Nilai tidak valid.";
  }

  return result;
};

export const describeError = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;
