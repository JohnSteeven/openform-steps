import { describe, it, expect } from 'vitest';
import {
  exportFormToJson,
  importFormFromJson,
  exportResponsesToCsv,
  chunkedCsvExport,
} from '../../packages/core/src/engine/export-import';
import { createDefaultForm } from '../../packages/core/src/schema/defaults';
import { FormSubmission } from '../../packages/core/src/schema/types';

describe('Export and Import Engine', () => {
  it('exports and re-imports form schema losslessly', () => {
    const original = createDefaultForm('CSAT Survey');
    const jsonStr = exportFormToJson(original);
    expect(typeof jsonStr).toBe('string');

    const result = importFormFromJson(jsonStr);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(original.id);
    expect(result.data?.title).toBe('CSAT Survey');
    expect(result.data?.steps).toHaveLength(original.steps.length);
  });

  it('rejects invalid JSON structures gracefully without crashing', () => {
    const result1 = importFormFromJson('{ invalid syntax ');
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('JSON parsing syntax error');

    const result2 = importFormFromJson(JSON.stringify({ title: 'No Steps' }));
    expect(result2.success).toBe(false);
    expect(result2.error).toBeDefined();
  });

  it('exports responses to sanitized CSV preventing formula injection', () => {
    const schema = createDefaultForm('Test Export');
    const submissions: FormSubmission[] = [
      {
        id: 'sub_1',
        formId: schema.id,
        formTitle: schema.title,
        submittedAt: '2026-11-08T10:00:00Z',
        data: {
          full_name: '=cmd|/c calc.exe!A0', // Potential CSV injection attempt
          email_address: 'safe@example.com',
        },
      },
    ];

    const csv = exportResponsesToCsv(schema, submissions);
    expect(csv).toContain('Submission ID');
    expect(csv).toContain('safe@example.com');
    // Notice leading = is prepended with single quote to prevent execution in spreadsheet apps
    expect(csv).toContain("\"'=cmd|/c calc.exe!A0\"");
  });

  it('executes chunked CSV export asynchronously without blocking', async () => {
    const schema = createDefaultForm('Large Dataset');
    const submissions: FormSubmission[] = Array.from({ length: 50 }, (_, i) => ({
      id: `sub_${i}`,
      formId: schema.id,
      formTitle: schema.title,
      submittedAt: '2026-11-08T10:00:00Z',
      data: { full_name: `User ${i}`, email_address: `user${i}@example.com` },
    }));

    let progressRecorded = false;
    const csv = await chunkedCsvExport(schema, submissions, (p) => {
      progressRecorded = true;
      expect(p).toBeGreaterThanOrEqual(0);
    });

    expect(progressRecorded).toBe(true);
    expect(csv).toContain('user49@example.com');
  });
});
