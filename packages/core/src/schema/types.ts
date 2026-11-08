export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'phone'
  | 'date'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'rating'
  | 'consent'
  | 'content';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export interface FieldConditionRule {
  fieldId: string;
  operator: ConditionOperator;
  value?: any;
}

export interface FieldCondition {
  logicalOperator?: 'and' | 'or';
  rules: FieldConditionRule[];
}

export interface StepCondition {
  action: 'skip' | 'show';
  condition: FieldCondition;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  customMessage?: string;
}

export interface FieldSchema {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  defaultValue?: any;
  options?: SelectOption[];
  validation?: ValidationRules;
  visibilityCondition?: FieldCondition;
  ariaLabel?: string;
  contentHeading?: string;
  contentText?: string;
  ratingMax?: number; // default 5
  ratingIcon?: 'star' | 'heart' | 'thumb';
}

export interface StepSchema {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  condition?: StepCondition;
}

export interface FormSettings {
  submitButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  confirmationTitle?: string;
  confirmationMessage?: string;
  showProgressBar?: boolean;
  progressType?: 'bar' | 'steps' | 'percentage';
  themeMode?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  clearHiddenValues?: boolean;
  allowStepJump?: boolean;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  version: string;
  steps: StepSchema[];
  settings: FormSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  data: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
