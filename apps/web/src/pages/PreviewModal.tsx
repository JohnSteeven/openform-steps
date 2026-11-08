import React, { useState } from 'react';
import { FormSchema } from '@openform-steps/core';
import { FormRenderer } from '@openform-steps/react';
import { saveSubmission } from '../storage/storage';
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

interface PreviewModalProps {
  schema: FormSchema;
  onClose: () => void;
  onSubmissionRecorded?: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  schema,
  onClose,
  onSubmissionRecorded,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [renderKey, setRenderKey] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (data: Record<string, any>) => {
    saveSubmission(schema.id, schema.title, data);
    onSubmissionRecorded?.();
    setToastMessage('Test submission recorded locally! Check the "Responses" tab to inspect.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReset = () => {
    setRenderKey((k) => k + 1);
  };

  const containerWidth =
    device === 'mobile'
      ? 'max-w-[390px]'
      : device === 'tablet'
      ? 'max-w-[640px]'
      : 'max-w-3xl';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h3 id="preview-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Interactive Preview: {schema.title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline-block">
              Simulated Live Environment
            </span>
          </div>

          {/* Device switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              title="Desktop View (Full Width)"
              aria-label="Desktop preview"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              title="Tablet View (640px)"
              aria-label="Tablet preview"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                device === 'tablet'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              title="Mobile View (390px)"
              aria-label="Mobile preview"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Reset Form to Start"
              aria-label="Reset test form"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Preview"
              aria-label="Close preview modal"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Viewport Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center">
          <div
            className={`w-full ${containerWidth} transition-all duration-300 ${
              device === 'mobile'
                ? 'border-[6px] border-slate-800 dark:border-slate-700 rounded-3xl p-3 bg-white dark:bg-slate-900 shadow-2xl my-4'
                : ''
            }`}
          >
            <FormRenderer
              key={renderKey}
              schema={schema}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

