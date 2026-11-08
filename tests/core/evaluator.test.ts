import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../../packages/core/src/engine/evaluator';

describe('Condition Evaluator', () => {
  it('returns true when condition is empty or undefined', () => {
    expect(evaluateCondition(undefined, {})).toBe(true);
    expect(evaluateCondition({ rules: [] }, {})).toBe(true);
  });

  it('evaluates "equals" and "not_equals" correctly', () => {
    const condition = {
      rules: [{ fieldId: 'role', operator: 'equals' as const, value: 'developer' }],
    };
    expect(evaluateCondition(condition, { role: 'developer' })).toBe(true);
    expect(evaluateCondition(condition, { role: 'designer' })).toBe(false);

    const notEqualsCondition = {
      rules: [{ fieldId: 'role', operator: 'not_equals' as const, value: 'manager' }],
    };
    expect(evaluateCondition(notEqualsCondition, { role: 'developer' })).toBe(true);
    expect(evaluateCondition(notEqualsCondition, { role: 'manager' })).toBe(false);
  });

  it('evaluates "contains" and "not_contains" for strings and arrays', () => {
    // Array (e.g. multi-select checkboxes)
    const arrayCondition = {
      rules: [{ fieldId: 'features', operator: 'contains' as const, value: 'pro' }],
    };
    expect(evaluateCondition(arrayCondition, { features: ['basic', 'pro', 'enterprise'] })).toBe(true);
    expect(evaluateCondition(arrayCondition, { features: ['basic'] })).toBe(false);

    // String
    const strCondition = {
      rules: [{ fieldId: 'email', operator: 'contains' as const, value: '@company.com' }],
    };
    expect(evaluateCondition(strCondition, { email: 'john@company.com' })).toBe(true);
    expect(evaluateCondition(strCondition, { email: 'john@gmail.com' })).toBe(false);
  });

  it('evaluates "greater_than" and "less_than" for numbers', () => {
    const gtCondition = {
      rules: [{ fieldId: 'age', operator: 'greater_than' as const, value: 18 }],
    };
    expect(evaluateCondition(gtCondition, { age: 25 })).toBe(true);
    expect(evaluateCondition(gtCondition, { age: 16 })).toBe(false);

    const ltCondition = {
      rules: [{ fieldId: 'score', operator: 'less_than' as const, value: 50 }],
    };
    expect(evaluateCondition(ltCondition, { score: 30 })).toBe(true);
    expect(evaluateCondition(ltCondition, { score: 75 })).toBe(false);
  });

  it('evaluates "is_empty" and "is_not_empty"', () => {
    const emptyCondition = {
      rules: [{ fieldId: 'notes', operator: 'is_empty' as const }],
    };
    expect(evaluateCondition(emptyCondition, { notes: '' })).toBe(true);
    expect(evaluateCondition(emptyCondition, { notes: '   ' })).toBe(true);
    expect(evaluateCondition(emptyCondition, { notes: [] })).toBe(true);
    expect(evaluateCondition(emptyCondition, { notes: 'hello' })).toBe(false);

    const notEmptyCondition = {
      rules: [{ fieldId: 'notes', operator: 'is_not_empty' as const }],
    };
    expect(evaluateCondition(notEmptyCondition, { notes: 'filled' })).toBe(true);
    expect(evaluateCondition(notEmptyCondition, { notes: '' })).toBe(false);
  });

  it('evaluates compound conditions with AND / OR', () => {
    const andCondition = {
      logicalOperator: 'and' as const,
      rules: [
        { fieldId: 'tier', operator: 'equals' as const, value: 'premium' },
        { fieldId: 'verified', operator: 'equals' as const, value: true },
      ],
    };
    expect(evaluateCondition(andCondition, { tier: 'premium', verified: true })).toBe(true);
    expect(evaluateCondition(andCondition, { tier: 'premium', verified: false })).toBe(false);

    const orCondition = {
      logicalOperator: 'or' as const,
      rules: [
        { fieldId: 'plan', operator: 'equals' as const, value: 'enterprise' },
        { fieldId: 'custom_quote', operator: 'equals' as const, value: true },
      ],
    };
    expect(evaluateCondition(orCondition, { plan: 'starter', custom_quote: true })).toBe(true);
    expect(evaluateCondition(orCondition, { plan: 'enterprise', custom_quote: false })).toBe(true);
    expect(evaluateCondition(orCondition, { plan: 'starter', custom_quote: false })).toBe(false);
  });
});

