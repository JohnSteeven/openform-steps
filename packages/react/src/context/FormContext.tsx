import React, { createContext, useContext } from 'react';
import { FieldSchema, FormSchema } from '@openform-steps/core';

export interface FormContextType {
  schema: FormSchema;
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  currentStepIndex: number;
  isSubmitting: boolean;
  disabled?: boolean;
  setFieldValue: (fieldId: string, value: any) => void;
  setFieldTouched: (fieldId: string, isTouched?: boolean) => void;
  goToNextStep: () => boolean;
  goToPrevStep: () => boolean;
  goToStep: (stepIndex: number) => boolean;
  submitForm: () => Promise<void>;
  customFields?: Record<string, React.ComponentType<CustomFieldProps>>;
}

export interface CustomFieldProps {
  field: FieldSchema;
  value: any;
  error?: string;
  onChange: (val: any) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export const FormContext = createContext<FormContextType | null>(null);

export function useFormContext(): FormContextType {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
}
