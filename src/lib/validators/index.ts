import type { ToolId } from "~/lib/processors/types";

export type ValidationResult = { ok: true } | { ok: false; message: string };

const OK: ValidationResult = { ok: true };

function validateJson(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return OK;
  try {
    JSON.parse(trimmed);
    return OK;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { ok: false, message: `Invalid JSON: ${message}` };
  }
}

function validateJs(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return OK;
  // ES module syntax can't be parsed by Function ctor; treat as OK to avoid false positives.
  if (/(^|\n)\s*(import|export)\s/.test(trimmed)) return OK;
  try {
    new Function(trimmed);
    return OK;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JavaScript";
    return { ok: false, message: `Invalid JavaScript: ${message}` };
  }
}

const VALIDATORS: Partial<Record<ToolId, (input: string) => ValidationResult>> =
  {
    "format-json": validateJson,
    "minify-js": validateJs,
  };

export function validate(toolId: ToolId, input: string): ValidationResult {
  const fn = VALIDATORS[toolId];
  return fn ? fn(input) : OK;
}
