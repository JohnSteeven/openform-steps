import React, { useState, useEffect } from 'react';
import { FormSchema } from '@openform-steps/core';
import { FormRenderer } from '@openform-steps/react';
import { getPublicForm, submitPublicForm } from '../api/client';
import { getActiveFormSchema } from '../storage/form-manager';
import { saveSubmission } from '../storage/storage';
import {
  Layers,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface PublicFormPageProps {
  formId: string;
  onBackToHome?: () => void;
}

export const PublicFormPage: React.FC<PublicFormPageProps> = ({ formId, onBackToHome }) => {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<{ code: string; message: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorStatus(null);

    async function loadForm() {
      try {
        // Try fetching from backend public API
        const data = await getPublicForm(formId);
        if (isMounted) {
          setSchema(data.schema);
          setLoading(false);
        }
      } catch (err: any) {
        // Fallback for local demo mode if backend is not running
        const localActive = getActiveFormSchema();
        if (localActive.id === formId) {
          if (isMounted) {
            setSchema(localActive);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setErrorStatus({
            code: 'NOT_AVAILABLE',
            message: err.message || 'This form is currently not available or has expired.',
          });
          setLoading(false);
        }
      }
    }

    loadForm();
    return () => {
      isMounted = false;
    };
  }, [formId]);

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      // Attempt backend submission
      const res = await submitPublicForm(formId, answers);
      setSubmissionId(res.submissionId);
      setIsSubmitted(true);
    } catch {
      // Fallback: save to local sandbox
      const localSub = saveSubmission(formId, schema?.title || 'Public Form', answers);
      setSubmissionId(localSub.id);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top minimal header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200">
            OpenForm Steps
          </span>
        </div>

        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Open Builder</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full my-auto">
        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Loading form...</p>
          </div>
        ) : errorStatus ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Form Unavailable
            </h2>
            <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
              {errorStatus.message}
            </p>
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Return to Form Builder
              </button>
            )}
          </div>
        ) : isSubmitted ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {schema?.settings?.confirmationTitle || 'Submission Received!'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
              {schema?.settings?.confirmationMessage ||
                'Thank you for completing this form. Your response has been securely recorded.'}
            </p>
            {submissionId && (
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                Tracking ID: {submissionId}
              </div>
            )}
          </div>
        ) : schema ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
            <FormRenderer
              schema={schema}
              onSubmit={handleSubmit}
            />
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full text-center text-[11px] text-slate-400 dark:text-slate-500 mt-12">
        <span>Powered by </span>
        <a
          href="https://github.com/JohnSteeven/openform-steps"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          OpenForm Steps
        </a>
        <span> — Free Accessible Open-Source Form Builder</span>
      </footer>
    </div>
  );
};
