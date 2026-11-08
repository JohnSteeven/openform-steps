import { describe, it, expect } from 'vitest';
import {
  getNextStepIndex,
  getPrevStepIndex,
  calculateProgress,
  isStepActive,
} from '../../packages/core/src/engine/state-machine';
import { FormSchema } from '../../packages/core/src/schema/types';

describe('Multi-Step State Machine', () => {
  const sampleSchema: FormSchema = {
    id: 'test-form',
    title: 'Test Form',
    version: '1.0.0',
    settings: {},
    steps: [
      {
        id: 's1',
        title: 'Step 1: Info',
        fields: [{ id: 'account_type', type: 'radio', label: 'Type' }],
      },
      {
        id: 's2',
        title: 'Step 2: Business Details',
        condition: {
          action: 'show',
          condition: {
            rules: [{ fieldId: 'account_type', operator: 'equals', value: 'business' }],
          },
        },
        fields: [{ id: 'tax_id', type: 'text', label: 'Tax ID' }],
      },
      {
        id: 's3',
        title: 'Step 3: Review',
        fields: [{ id: 'confirm', type: 'consent', label: 'Confirm' }],
      },
    ],
  };

  it('determines step activation based on conditional rules', () => {
    // Individual account: Step 2 should be skipped
    expect(isStepActive(sampleSchema.steps[1], { account_type: 'individual' })).toBe(false);

    // Business account: Step 2 should be active
    expect(isStepActive(sampleSchema.steps[1], { account_type: 'business' })).toBe(true);
  });

  it('calculates getNextStepIndex skipping inactive steps', () => {
    // Individual skips step 2, jumps from 0 to 2
    expect(getNextStepIndex(sampleSchema, 0, { account_type: 'individual' })).toBe(2);

    // Business proceeds from step 0 to step 1
    expect(getNextStepIndex(sampleSchema, 0, { account_type: 'business' })).toBe(1);

    // Last step returns null
    expect(getNextStepIndex(sampleSchema, 2, {})).toBeNull();
  });

  it('calculates getPrevStepIndex correctly with history', () => {
    // From step 2 back to 0 when step 1 was skipped
    expect(getPrevStepIndex(sampleSchema, 2, [0, 2], { account_type: 'individual' })).toBe(0);

    // From step 2 back to 1 when step 1 was visited
    expect(getPrevStepIndex(sampleSchema, 2, [0, 1, 2], { account_type: 'business' })).toBe(1);

    // From first step returns null
    expect(getPrevStepIndex(sampleSchema, 0, [0], {})).toBeNull();
  });

  it('calculates progress metrics dynamically', () => {
    // Individual: 2 total active steps (step 1 and step 3)
    const prog1 = calculateProgress(sampleSchema, 0, { account_type: 'individual' });
    expect(prog1.currentStepNumber).toBe(1);
    expect(prog1.totalActiveSteps).toBe(2);
    expect(prog1.percentage).toBe(50);

    // Business: 3 total active steps
    const prog2 = calculateProgress(sampleSchema, 1, { account_type: 'business' });
    expect(prog2.currentStepNumber).toBe(2);
    expect(prog2.totalActiveSteps).toBe(3);
    expect(prog2.percentage).toBe(67);
  });
});
