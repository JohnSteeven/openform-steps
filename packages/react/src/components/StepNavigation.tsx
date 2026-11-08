import React from 'react';
import { FormSettings } from '@openform-steps/core';
import { cn } from '../theme/theme';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
  settings?: FormSettings;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  disabled,
  settings,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const nextText = settings?.nextButtonText || 'Continue';
  const backText = settings?.backButtonText || 'Back';
  const submitText = settings?.submitButtonText || 'Submit Form';

  return (
    <footer className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            disabled={disabled || isSubmitting}
            className={cn(
              'px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-sm',
              'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900',
              'hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 min-h-[44px] cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-slate-400',
              (disabled || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Go to previous step"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backText}</span>
          </button>
        )}
      </div>

      <div>
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || isSubmitting}
            aria-busy={isSubmitting}
            className={cn(
              'px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all shadow-sm flex items-center gap-2 min-h-[44px] cursor-pointer',
              'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              (disabled || isSubmitting) && 'opacity-60 cursor-not-allowed'
            )}
            style={{ backgroundColor: settings?.primaryColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin motion-reduce:hidden" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>{submitText}</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={disabled || isSubmitting}
            className={cn(
              'px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all shadow-sm flex items-center gap-2 min-h-[44px] cursor-pointer',
              'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
            style={{ backgroundColor: settings?.primaryColor }}
            aria-label="Continue to next step"
          >
            <span>{nextText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </footer>
  );
};

