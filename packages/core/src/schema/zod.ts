import { z } from 'zod';

export const ConditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'greater_than',
  'less_than',
  'is_empty',
  'is_not_empty',
  'in',
  'not_in',
]);

export const FieldConditionRuleSchema = z.object({
  fieldId: z.string().min(1),
  operator: ConditionOperatorSchema,
  value: z.any().optional(),
});

export const FieldConditionSchema = z.object({
  logicalOperator: z.enum(['and', 'or']).optional(),
  rules: z.array(FieldConditionRuleSchema),
});

export const StepConditionSchema = z.object({
  action: z.enum(['skip', 'show']),
  condition: FieldConditionSchema,
});

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const ValidationRulesSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional(),
  customMessage: z.string().optional(),
});

export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'number',
  'phone',
  'date',
  'textarea',
  'dropdown',
  'radio',
  'checkbox',
  'rating',
  'consent',
  'content',
]);

export const FieldSchemaValidator = z.object({
  id: z.string().min(1),
  type: FieldTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  options: z.array(SelectOptionSchema).optional(),
  validation: ValidationRulesSchema.optional(),
  visibilityCondition: FieldConditionSchema.optional(),
  ariaLabel: z.string().optional(),
  contentHeading: z.string().optional(),
  contentText: z.string().optional(),
  ratingMax: z.number().min(2).max(10).optional(),
  ratingIcon: z.enum(['star', 'heart', 'thumb']).optional(),
});

export const StepSchemaValidator = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FieldSchemaValidator),
  condition: StepConditionSchema.optional(),
});

export const FormSettingsValidator = z.object({
  submitButtonText: z.string().optional(),
  nextButtonText: z.string().optional(),
  backButtonText: z.string().optional(),
  confirmationTitle: z.string().optional(),
  confirmationMessage: z.string().optional(),
  showProgressBar: z.boolean().optional(),
  progressType: z.enum(['bar', 'steps', 'percentage']).optional(),
  themeMode: z.enum(['light', 'dark', 'auto']).optional(),
  primaryColor: z.string().optional(),
  clearHiddenValues: z.boolean().optional(),
  allowStepJump: z.boolean().optional(),
});

export const FormSchemaValidator = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.string(),
  steps: z.array(StepSchemaValidator).min(1, 'A form must have at least one step.'),
  settings: FormSettingsValidator,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
