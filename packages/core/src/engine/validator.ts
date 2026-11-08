import { FieldSchema, StepSchema, ValidationResult } from '../schema/types';
import { evaluateCondition } from './evaluator';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export function validateField(
  field: FieldSchema,
  value: any,
  formValues: Record<string, any> = {}
): string | null {
  // Content block fields are presentation only, never fail validation
  if (field.type === 'content') {
    return null;
  }

  // If field is hidden by conditional logic, it is exempt from validation
  if (field.visibilityCondition && !evaluateCondition(field.visibilityCondition, formValues)) {
    return null;
  }

  const isValueEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (field.type === 'consent' && value !== true);

  // Required check
  if (field.required && isValueEmpty) {
    if (field.validation?.customMessage) {
      return field.validation.customMessage;
    }
    if (field.type === 'consent') {
      return 'You must accept the terms to proceed.';
    }
    if (field.type === 'rating') {
      return `Please provide a rating for "${field.label}".`;
    }
    return `"${field.label}" is required.`;
  }

  // If empty and not required, pass
  if (isValueEmpty) {
    return null;
  }

  // Specific field type validations
  if (field.type === 'email') {
    if (typeof value === 'string' && !EMAIL_REGEX.test(value.trim())) {
      return field.validation?.customMessage || 'Please enter a valid email address (e.g. name@example.com).';
    }
  }

  if (field.type === 'phone') {
    if (typeof value === 'string' && !PHONE_REGEX.test(value.trim())) {
      return field.validation?.customMessage || 'Please enter a valid telephone number.';
    }
  }

  if (field.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      return 'Please enter a valid numeric value.';
    }
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return field.validation.customMessage || `Value must be at least ${field.validation.min}.`;
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return field.validation.customMessage || `Value must be no more than ${field.validation.max}.`;
    }
  }

  if (field.type === 'text' || field.type === 'textarea') {
    const str = String(value);
    if (field.validation?.minLength !== undefined && str.length < field.validation.minLength) {
      return field.validation.customMessage || `Must be at least ${field.validation.minLength} characters.`;
    }
    if (field.validation?.maxLength !== undefined && str.length > field.validation.maxLength) {
      return field.validation.customMessage || `Cannot exceed ${field.validation.maxLength} characters.`;
    }
  }

  // Custom regex pattern validation
  if (field.validation?.pattern) {
    try {
      const reg = new RegExp(field.validation.pattern);
      if (!reg.test(String(value))) {
        return field.validation.patternMessage || field.validation.customMessage || 'The input format is invalid.';
      }
    } catch {
      // Ignore invalid regex safely
    }
  }

  return null;
}

export function validateStep(
  step: StepSchema,
  formValues: Record<string, any>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of step.fields) {
    const error = validateField(field, formValues[field.id], formValues);
    if (error) {
      errors[field.id] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAllSteps(
  steps: StepSchema[],
  formValues: Record<string, any>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const step of steps) {
    const stepResult = validateStep(step, formValues);
    Object.assign(errors, stepResult.errors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
