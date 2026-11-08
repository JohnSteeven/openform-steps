import React from 'react';
import { FieldSchema } from '@openform-steps/core';
import { cn } from '../theme/theme';

interface FieldProps {
  field: FieldSchema;
  value: any;
  error?: string;
  onChange: (val: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const CheckboxField: React.FC<FieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}) => {
  const legendId = `legend-${field.id}`;
  const errorId = `error-${field.id}`;
  const helperId = `helper-${field.id}`;

  const currentValues: string[] = Array.isArray(value) ? value : [];

  const handleToggle = (optVal: string) => {
    if (currentValues.includes(optVal)) {
      onChange(currentValues.filter((v) => v !== optVal));
    } else {
      onChange([...currentValues, optVal]);
    }
  };

  const describedBy = [
    field.helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className="w-full"
      role="group"
      aria-labelledby={legendId}
      aria-required={field.required}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy || undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <legend
          id={legendId}
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {field.label}
          {field.required && (
            <span className="text-rose-500 ml-1 font-bold" aria-hidden="true">
              *
            </span>
          )}
        </legend>
        {!field.required && (
          <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
        )}
      </div>

      <div className="space-y-2">
        {field.options?.map((opt) => {
          const isChecked = currentValues.includes(opt.value);
          const checkboxId = `chk-${field.id}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={checkboxId}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px]',
                isChecked
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <input
                id={checkboxId}
                type="checkbox"
                value={opt.value}
                checked={isChecked}
                disabled={disabled}
                onChange={() => handleToggle(opt.value)}
                onBlur={onBlur}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {field.helperText && (
        <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          {field.helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1"
        >
          <span aria-hidden="true">●</span>
          {error}
        </p>
      )}
    </fieldset>
  );
};
