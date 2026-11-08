import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  FormSchema,
  calculateProgress,
  getNextStepIndex,
  getPrevStepIndex,
  isLastStep,
  getVisibleFields,
  validateStep,
} from '@openform-steps/core';
import { FormContext, CustomFieldProps } from '../context/FormContext';
import { FieldRenderer } from './FieldRenderer';
import { ProgressBar } from './ProgressBar';
import { StepHeader } from './StepHeader';
import { ErrorSummary } from './ErrorSummary';
import { StepNavigation } from './StepNavigation';
import { cn, FormTheme } from '../theme/theme';
import { CheckCircle2 } from 'lucide-react';

export interface FormRendererProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onChange?: (values: Record<string, any>) => void;
  onStepChange?: (stepIndex: number) => void;
  onError?: (errors: Record<string, string>) => void;
  customFields?: Record<string, React.ComponentType<CustomFieldProps>>;
  theme?: Partial<FormTheme>;
  className?: string;
  disabled?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  initialValues = {},
  onSubmit,
  onChange,
  onStepChange,
  onError,
  customFields,
  className,
  disabled = false,
}) => {
  // Collect default field values from schema
  const defaultValues = useMemo(() => {
    const defaults: Record<string, any> = { ...initialValues };
    schema.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (defaults[field.id] === undefined && field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
    });
    return defaults;
  }, [schema, initialValues]);

  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [visitedStepIndices, setVisitedStepIndices] = useState<number[]>([0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const containerRef = useRef<any>(null);

  // Current step schema
  const currentStep = schema.steps[currentStepIndex] || schema.steps[0];

  // Visible fields on current step
  const visibleFields = useMemo(() => {
    if (!currentStep) return [];
    return getVisibleFields(currentStep, values);
  }, [currentStep, values]);

  // Progress metrics
  const progress = useMemo(() => {
    return calculateProgress(schema, currentStepIndex, values);
  }, [schema, currentStepIndex, values]);

  // Labels mapping for error summary
  const fieldLabels = useMemo(() => {
    const map: Record<string, string> = {};
    schema.steps.forEach((s) => {
      s.fields.forEach((f) => {
        map[f.id] = f.label;
      });
    });
    return map;
  }, [schema]);

  const setFieldValue = useCallback((fieldId: string, val: any) => {
    setValues((prev) => {
      const next = { ...prev, [fieldId]: val };
      onChange?.(next);
      return next;
    });

    // Clear error for field if valid
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const copy = { ...prev };
      delete copy[fieldId];
      return copy;
    });
  }, [onChange]);

  const setFieldTouched = useCallback((fieldId: string, isT = true) => {
    setTouched((prev) => ({ ...prev, [fieldId]: isT }));
  }, []);

  const scrollToTop = useCallback(() => {
    if (containerRef.current && typeof containerRef.current.scrollIntoView === 'function') {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const goToNextStep = useCallback((): boolean => {
    if (!currentStep) return false;

    // Validate current step
    const validation = validateStep(currentStep, values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Mark fields touched
      const newTouched: Record<string, boolean> = {};
      currentStep.fields.forEach((f) => {
        newTouched[f.id] = true;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
      onError?.(validation.errors);
      return false;
    }

    setErrors({});
    const nextIdx = getNextStepIndex(schema, currentStepIndex, values);
    if (nextIdx !== null) {
      setCurrentStepIndex(nextIdx);
      setVisitedStepIndices((prev) => (prev.includes(nextIdx) ? prev : [...prev, nextIdx]));
      onStepChange?.(nextIdx);
      scrollToTop();
      return true;
    }
    return false;
  }, [currentStep, schema, currentStepIndex, values, onError, onStepChange, scrollToTop]);

  const goToPrevStep = useCallback((): boolean => {
    const prevIdx = getPrevStepIndex(schema, currentStepIndex, visitedStepIndices, values);
    if (prevIdx !== null) {
      setCurrentStepIndex(prevIdx);
      onStepChange?.(prevIdx);
      scrollToTop();
      return true;
    }
    return false;
  }, [schema, currentStepIndex, visitedStepIndices, values, onStepChange, scrollToTop]);

  const goToStep = useCallback((stepIdx: number): boolean => {
    if (stepIdx >= 0 && stepIdx < schema.steps.length) {
      setCurrentStepIndex(stepIdx);
      onStepChange?.(stepIdx);
      scrollToTop();
      return true;
    }
    return false;
  }, [schema.steps.length, onStepChange, scrollToTop]);

  const submitForm = useCallback(async () => {
    if (!currentStep) return;

    // Validate current step
    const validation = validateStep(currentStep, values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const newTouched: Record<string, boolean> = {};
      currentStep.fields.forEach((f) => {
        newTouched[f.id] = true;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
      onError?.(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      setIsSubmitted(true);
      scrollToTop();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, values, onSubmit, onError, scrollToTop]);

  const isCurrentStepLast = useMemo(() => {
    return isLastStep(schema, currentStepIndex, values);
  }, [schema, currentStepIndex, values]);

  const isCurrentStepFirst = currentStepIndex === 0;

  const contextValue = useMemo(
    () => ({
      schema,
      values,
      errors,
      touched,
      currentStepIndex,
      isSubmitting,
      disabled,
      setFieldValue,
      setFieldTouched,
      goToNextStep,
      goToPrevStep,
      goToStep,
      submitForm,
      customFields,
    }),
    [
      schema,
      values,
      errors,
      touched,
      currentStepIndex,
      isSubmitting,
      disabled,
      setFieldValue,
      setFieldTouched,
      goToNextStep,
      goToPrevStep,
      goToStep,
      submitForm,
      customFields,
    ]
  );

  // Success Confirmation View
  if (isSubmitted) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-label="Submission Confirmation"
        className={cn(
          'w-full max-w-2xl mx-auto p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900 shadow-xl text-center',
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          {schema.settings.confirmationTitle || 'Thank You!'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
          {schema.settings.confirmationMessage || 'Your submission has been received successfully.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(defaultValues);
            setErrors({});
            setTouched({});
            setCurrentStepIndex(0);
            setIsSubmitted(false);
          }}
          className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={containerRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (isCurrentStepLast) {
            submitForm();
          } else {
            goToNextStep();
          }
        }}
        noValidate
        aria-label={schema.title}
        className={cn(
          'w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900 shadow-lg transition-all',
          className
        )}
      >
        {schema.settings.showProgressBar && (
          <ProgressBar
            progress={progress}
            type={schema.settings.progressType || 'bar'}
            allowStepJump={schema.settings.allowStepJump}
            onJumpToStep={goToStep}
            primaryColor={schema.settings.primaryColor}
          />
        )}

        {currentStep && (
          <StepHeader
            step={currentStep}
            stepNumber={progress.currentStepNumber}
            totalSteps={progress.totalActiveSteps}
          />
        )}

        <ErrorSummary errors={errors} labels={fieldLabels} />

        <div className="space-y-6">
          {visibleFields.map((field) => (
            <FieldRenderer key={field.id} field={field} />
          ))}
        </div>

        <StepNavigation
          isFirstStep={isCurrentStepFirst}
          isLastStep={isCurrentStepLast}
          isSubmitting={isSubmitting}
          disabled={disabled}
          settings={schema.settings}
          onPrev={goToPrevStep}
          onNext={goToNextStep}
          onSubmit={submitForm}
        />
      </form>
    </FormContext.Provider>
  );
};
