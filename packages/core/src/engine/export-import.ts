import { FormSchema, FormSubmission } from '../schema/types';
import { FormSchemaValidator } from '../schema/zod';
import { migrateFormSchema } from '../schema/version';

export interface ImportResult {
  success: boolean;
  data?: FormSchema;
  error?: string;
}

export function exportFormToJson(schema: FormSchema, pretty = true): string {
  return JSON.stringify(schema, null, pretty ? 2 : 0);
}

export function importFormFromJson(jsonString: string): ImportResult {
  try {
    const raw = JSON.parse(jsonString);
    if (!raw || typeof raw !== 'object') {
      return {
        success: false,
        error: 'Input is not a valid JSON object.',
      };
    }

    const migrated = migrateFormSchema(raw);
    const parsed = FormSchemaValidator.safeParse(migrated);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        success: false,
        error: `Validation error at "${issue.path.join('.')}": ${issue.message}`,
      };
    }

    return {
      success: true,
      data: parsed.data as FormSchema,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON parsing syntax error: ${err.message || 'Invalid format'}`,
    };
  }
}

export function exportResponsesToJson(responses: FormSubmission[], pretty = true): string {
  return JSON.stringify(responses, null, pretty ? 2 : 0);
}

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  if (Array.isArray(value)) {
    str = value.join('; ');
  } else if (typeof value === 'object') {
    str = JSON.stringify(value);
  }

  // Prevent CSV injection by escaping leading =, +, -, @
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

export function exportResponsesToCsv(
  schema: FormSchema,
  submissions: FormSubmission[]
): string {
  // Collect all unique field headers from all steps
  const fieldHeaders: Array<{ id: string; label: string }> = [];
  schema.steps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.type !== 'content' && !fieldHeaders.some((h) => h.id === field.id)) {
        fieldHeaders.push({ id: field.id, label: field.label || field.id });
      }
    });
  });

  const headers = ['Submission ID', 'Submission Date', ...fieldHeaders.map((h) => h.label)];
  const headerRow = headers.map(escapeCsvCell).join(',');

  const rows = submissions.map((sub) => {
    const rowValues = [
      sub.id,
      sub.submittedAt,
      ...fieldHeaders.map((h) => sub.data?.[h.id]),
    ];
    return rowValues.map(escapeCsvCell).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

/**
 * High-performance chunked processor for exporting large datasets
 * Yields periodically to keep UI thread responsive (INP < 200ms)
 */
export async function chunkedCsvExport(
  schema: FormSchema,
  submissions: FormSubmission[],
  onProgress?: (percent: number) => void
): Promise<string> {
  const chunkSize = 200;
  const parts: string[] = [];

  const fieldHeaders: Array<{ id: string; label: string }> = [];
  schema.steps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.type !== 'content' && !fieldHeaders.some((h) => h.id === field.id)) {
        fieldHeaders.push({ id: field.id, label: field.label || field.id });
      }
    });
  });

  const headerRow = ['Submission ID', 'Submission Date', ...fieldHeaders.map((h) => h.label)]
    .map(escapeCsvCell)
    .join(',');
  parts.push(headerRow);

  for (let i = 0; i < submissions.length; i += chunkSize) {
    const chunk = submissions.slice(i, i + chunkSize);
    const chunkRows = chunk.map((sub) => {
      const row = [sub.id, sub.submittedAt, ...fieldHeaders.map((h) => sub.data?.[h.id])];
      return row.map(escapeCsvCell).join(',');
    });
    parts.push(...chunkRows);

    if (onProgress) {
      onProgress(Math.min(100, Math.round(((i + chunkSize) / submissions.length) * 100)));
    }

    // Yield control to main loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return parts.join('\r\n');
}
