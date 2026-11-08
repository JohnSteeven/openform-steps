import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorSummaryProps {
  errors: Record<string, string>;
  labels: Record<string, string>;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, labels }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorKeys = Object.keys(errors);

  useEffect(() => {
    if (errorKeys.length > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errorKeys.length]);

  if (errorKeys.length === 0) return null;

  const handleJumpToField = (fieldId: string) => {
    const el = document.getElementById(`field-${fieldId}`) || document.getElementById(`radio-${fieldId}`) || document.getElementById(`consent-${fieldId}`);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="mb-6 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
    >
      <div className="flex items-center gap-2 mb-2 font-semibold text-rose-800 dark:text-rose-300">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <h3 id="error-summary-title" className="text-sm font-bold">
          There are {errorKeys.length} errors that need your attention:
        </h3>
      </div>
      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-1">
        {errorKeys.map((fieldId) => (
          <li key={fieldId}>
            <button
              type="button"
              onClick={() => handleJumpToField(fieldId)}
              className="text-rose-700 dark:text-rose-300 underline font-medium hover:text-rose-900 dark:hover:text-rose-100 text-left cursor-pointer"
            >
              {labels[fieldId] || fieldId}: {errors[fieldId]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
