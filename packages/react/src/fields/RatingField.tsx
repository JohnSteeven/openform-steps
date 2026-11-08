import React, { useState } from 'react';
import { FieldSchema } from '@openform-steps/core';
import { cn } from '../theme/theme';
import { Star, Heart, ThumbsUp } from 'lucide-react';

interface FieldProps {
  field: FieldSchema;
  value: any;
  error?: string;
  onChange: (val: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const RatingField: React.FC<FieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const legendId = `legend-${field.id}`;
  const errorId = `error-${field.id}`;
  const helperId = `helper-${field.id}`;

  const ratingMax = field.ratingMax || 5;
  const currentRating = typeof value === 'number' ? value : 0;
  const activeRating = hoverRating !== null ? hoverRating : currentRating;

  const IconComponent =
    field.ratingIcon === 'heart'
      ? Heart
      : field.ratingIcon === 'thumb'
      ? ThumbsUp
      : Star;

  const describedBy = [
    field.helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className="w-full"
      role="radiogroup"
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
        <span className="text-xs text-slate-500">
          {currentRating > 0 ? `${currentRating} of ${ratingMax}` : !field.required ? 'Optional' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2 py-1">
        {Array.from({ length: ratingMax }, (_, i) => i + 1).map((starVal) => {
          const isFilled = starVal <= activeRating;
          const isSelected = starVal === currentRating;
          const itemId = `rating-${field.id}-${starVal}`;

          return (
            <button
              key={starVal}
              id={itemId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${starVal} out of ${ratingMax}`}
              disabled={disabled}
              onClick={() => onChange(starVal)}
              onMouseEnter={() => !disabled && setHoverRating(starVal)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              onBlur={onBlur}
              className={cn(
                'p-2 rounded-lg transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px] flex items-center justify-center',
                !disabled && 'hover:scale-110 active:scale-95 cursor-pointer',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <IconComponent
                className={cn(
                  'w-7 h-7 transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
                )}
              />
            </button>
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
