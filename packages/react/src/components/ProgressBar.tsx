import React from 'react';
import { MultiStepProgress } from '@openform-steps/core';
import { cn } from '../theme/theme';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  progress: MultiStepProgress;
  type?: 'bar' | 'steps' | 'percentage';
  allowStepJump?: boolean;
  onJumpToStep?: (index: number) => void;
  primaryColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  type = 'bar',
  allowStepJump,
  onJumpToStep,
  primaryColor,
}) => {
  const { currentStepNumber, totalActiveSteps, percentage, stepTitles, activeStepIndices } = progress;

  if (type === 'percentage') {
    return (
      <div
        className="w-full mb-6"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Form completion progress"
      >
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
          <span>
            Step {currentStepNumber} of {totalActiveSteps}
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{percentage}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out motion-reduce:transition-none rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: primaryColor }}
          />
        </div>
      </div>
    );
  }

  if (type === 'steps') {
    return (
      <nav aria-label="Form Steps Progress" className="w-full mb-8">
        <ol className="flex items-center justify-between w-full relative">
          {/* Connector line */}
          <div
            className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"
            aria-hidden="true"
          />

          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStepNumber;
            const isCurrent = stepNum === currentStepNumber;
            const targetStepIndex = activeStepIndices[idx];

            return (
              <li
                key={idx}
                className="flex flex-col items-center relative z-10"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <button
                  type="button"
                  disabled={!allowStepJump && !isCompleted}
                  onClick={() => allowStepJump && onJumpToStep?.(targetStepIndex)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-500',
                    allowStepJump || isCompleted ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  )}
                  aria-label={`${title} (${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'})`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                </button>
                <span
                  className={cn(
                    'text-[11px] font-medium mt-1.5 max-w-[80px] text-center truncate hidden sm:block',
                    isCurrent
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {title}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Default: Linear Bar
  return (
    <div
      className="w-full mb-6"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Form completion progress"
    >
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        <span className="truncate">
          Step {currentStepNumber} of {totalActiveSteps}: {stepTitles[currentStepNumber - 1]}
        </span>
        <span className="text-slate-500 dark:text-slate-400">{percentage}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out motion-reduce:transition-none rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: primaryColor }}
        />
      </div>
    </div>
  );
};

