import { describe, it, expect } from 'vitest';
import { validateField, validateStep } from '../../packages/core/src/engine/validator';
import { FieldSchema, StepSchema } from '../../packages/core/src/schema/types';

describe('Validation Engine', () => {
  it('validates required text fields', () => {
    const field: FieldSchema = { id: 'name', type: 'text', label: 'Full Name', required: true };
    expect(validateField(field, '')).toBe('"Full Name" is required.');
    expect(validateField(field, '   ')).toBe('"Full Name" is required.');
    expect(validateField(field, undefined)).toBe('"Full Name" is required.');
    expect(validateField(field, 'John Doe')).toBeNull();
  });

  it('validates email formats properly', () => {
    const field: FieldSchema = { id: 'email', type: 'email', label: 'Email', required: true };
    expect(validateField(field, 'not-an-email')).toBe('Please enter a valid email address (e.g. name@example.com).');
    expect(validateField(field, 'test@')).toBe('Please enter a valid email address (e.g. name@example.com).');
    expect(validateField(field, 'valid@example.com')).toBeNull();
  });

  it('validates numeric ranges', () => {
    const field: FieldSchema = {
      id: 'age',
      type: 'number',
      label: 'Age',
      required: true,
      validation: { min: 18, max: 65 },
    };
    expect(validateField(field, 15)).toBe('Value must be at least 18.');
    expect(validateField(field, 70)).toBe('Value must be no more than 65.');
    expect(validateField(field, 25)).toBeNull();
  });

  it('validates text length constraints', () => {
    const field: FieldSchema = {
      id: 'bio',
      type: 'textarea',
      label: 'Bio',
      validation: { minLength: 10, maxLength: 50 },
    };
    expect(validateField(field, 'short')).toBe('Must be at least 10 characters.');
    expect(validateField(field, 'a'.repeat(60))).toBe('Cannot exceed 50 characters.');
    expect(validateField(field, 'A perfectly valid biography.')).toBeNull();
  });

  it('validates consent checkboxes', () => {
    const field: FieldSchema = {
      id: 'terms',
      type: 'consent',
      label: 'Terms of Service',
      required: true,
    };
    expect(validateField(field, false)).toBe('You must accept the terms to proceed.');
    expect(validateField(field, undefined)).toBe('You must accept the terms to proceed.');
    expect(validateField(field, true)).toBeNull();
  });

  it('ignores hidden fields when conditional visibility is false', () => {
    const field: FieldSchema = {
      id: 'conditional_field',
      type: 'text',
      label: 'Extra Info',
      required: true,
      visibilityCondition: {
        rules: [{ fieldId: 'trigger', operator: 'equals', value: 'yes' }],
      },
    };

    // When condition matches: required check fails on empty
    expect(validateField(field, '', { trigger: 'yes' })).toBe('"Extra Info" is required.');

    // When condition DOES NOT match: hidden field passes validation
    expect(validateField(field, '', { trigger: 'no' })).toBeNull();
  });

  it('validates entire step and collects all field errors', () => {
    const step: StepSchema = {
      id: 'step_1',
      title: 'Step 1',
      fields: [
        { id: 'f1', type: 'text', label: 'Field 1', required: true },
        { id: 'f2', type: 'email', label: 'Field 2', required: true },
      ],
    };

    const result = validateStep(step, { f1: '', f2: 'invalid-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors.f1).toBe('"Field 1" is required.');
    expect(result.errors.f2).toBe('Please enter a valid email address (e.g. name@example.com).');

    const validResult = validateStep(step, { f1: 'Valid Name', f2: 'valid@example.com' });
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);
  });
});
