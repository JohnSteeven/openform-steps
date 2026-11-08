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

export const ConsentField: React.FC<FieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}) => {
  const inputId = `consent-${field.id}`;
  const errorId = `error-${field.id}`;
  const helperId = `helper-${field.id}`;

  const isChecked = Boolean(value);

  const describedBy = [
    field.helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all min-h-[44px]',
          isChecked
            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
          error && 'border-rose-500 bg-rose-50/20',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={isChecked}
          required={field.required}
          disabled={disabled}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
        />
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {field.label}
            {field.required && (
              <span className="text-rose-500 ml-1 font-bold" aria-hidden="true">
                *
              </span>
            )}
          </span>
          {field.helperText && (
            <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {field.helperText}
            </p>
          )}
        </div>
      </label>

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
    </div>
  );
};
