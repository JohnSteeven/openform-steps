import { FormSchema } from './types';

export const CURRENT_SCHEMA_VERSION = '1.0.0';

export function isSchemaCompatible(version: string): boolean {
  if (!version) return false;
  const [major] = version.split('.');
  const [currentMajor] = CURRENT_SCHEMA_VERSION.split('.');
  return major === currentMajor;
}

export function migrateFormSchema(rawSchema: any): FormSchema {
  if (!rawSchema || typeof rawSchema !== 'object') {
    throw new Error('Invalid form schema: expected an object.');
  }

  // Version 1.0.0 normalization
  const normalized: FormSchema = {
    id: rawSchema.id || `form_${Date.now()}`,
    title: rawSchema.title || 'Untitled Form',
    description: rawSchema.description || '',
    version: CURRENT_SCHEMA_VERSION,
    steps: Array.isArray(rawSchema.steps)
      ? rawSchema.steps.map((step: any, sIdx: number) => ({
          id: step.id || `step_${sIdx + 1}`,
          title: step.title || `Step ${sIdx + 1}`,
          description: step.description || '',
          condition: step.condition,
          fields: Array.isArray(step.fields)
            ? step.fields.map((f: any, fIdx: number) => ({
                id: f.id || `field_${sIdx}_${fIdx}`,
                type: f.type || 'text',
                label: f.label || 'Field',
                placeholder: f.placeholder,
                helperText: f.helperText,
                required: Boolean(f.required),
                defaultValue: f.defaultValue,
                options: f.options,
                validation: f.validation,
                visibilityCondition: f.visibilityCondition,
                ariaLabel: f.ariaLabel,
                contentHeading: f.contentHeading,
                contentText: f.contentText,
                ratingMax: f.ratingMax || 5,
                ratingIcon: f.ratingIcon || 'star',
              }))
            : [],
        }))
      : [],
    settings: {
      submitButtonText: rawSchema.settings?.submitButtonText || 'Submit Form',
      nextButtonText: rawSchema.settings?.nextButtonText || 'Continue',
      backButtonText: rawSchema.settings?.backButtonText || 'Back',
      confirmationTitle: rawSchema.settings?.confirmationTitle || 'Thank You!',
      confirmationMessage: rawSchema.settings?.confirmationMessage || 'Your submission has been received.',
      showProgressBar: rawSchema.settings?.showProgressBar ?? true,
      progressType: rawSchema.settings?.progressType || 'bar',
      themeMode: rawSchema.settings?.themeMode || 'auto',
      primaryColor: rawSchema.settings?.primaryColor || '#2563eb',
      clearHiddenValues: Boolean(rawSchema.settings?.clearHiddenValues),
      allowStepJump: Boolean(rawSchema.settings?.allowStepJump),
    },
    createdAt: rawSchema.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return normalized;
}
