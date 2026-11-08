import React from 'react';
import { StepSchema } from '@openform-steps/core';

interface StepHeaderProps {
  step: StepSchema;
  stepNumber: number;
  totalSteps: number;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ step, stepNumber, totalSteps }) => {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>
      <h2
        id={`step-title-${step.id}`}
        tabIndex={-1}
        className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 outline-none"
      >
        {step.title}
      </h2>
      {step.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
          {step.description}
        </p>
      )}
    </header>
  );
};
