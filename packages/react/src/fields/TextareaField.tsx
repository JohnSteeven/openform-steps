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

export const TextareaField: React.FC<FieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}) => {
  const inputId = `field-${field.id}`;
  const errorId = `error-${field.id}`;
  const helperId = `helper-${field.id}`;

  const describedBy = [
    field.helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  const currentLength = typeof value === 'string' ? value.length : 0;
  const maxChars = field.validation?.maxLength;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {field.label}
          {field.required && (
            <span className="text-rose-500 ml-1 font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {maxChars ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {currentLength} / {maxChars}
          </span>
        ) : !field.required ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
        ) : null}
      </div>

      <textarea
        id={inputId}
        rows={4}
        value={value ?? ''}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        maxLength={maxChars}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border text-base sm:text-sm transition-all outline-none resize-y min-h-[96px]',
          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
          error
            ? 'border-rose-500 ring-1 ring-rose-500 focus:ring-2 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
        )}
      />

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
    </div>
  );
};
