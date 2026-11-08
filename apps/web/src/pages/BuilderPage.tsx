import React, { useState, useEffect } from 'react';
import { FormSchema } from '@openform-steps/core';
import { FormBuilder } from '@openform-steps/builder';
import { saveDraft } from '../storage/storage';
import { PreviewModal } from './PreviewModal';
import { CheckCircle2, CloudOff, Eye } from 'lucide-react';

interface BuilderPageProps {
  schema: FormSchema;
  onSchemaChange: (updated: FormSchema) => void;
  onSubmissionRecorded?: () => void;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({
  schema,
  onSchemaChange,
  onSubmissionRecorded,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Debounced auto-save
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveDraft(schema);
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [schema]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Sub-header info banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Visual Form Builder
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design multi-step accessible forms with drag-and-drop, conditional logic, and instant browser persistence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Saved locally</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Saving draft...</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Form</span>
          </button>
        </div>
      </div>

      <FormBuilder
        initialSchema={schema}
        onChange={onSchemaChange}
        onPreviewToggle={() => setIsPreviewOpen(true)}
      />

      {isPreviewOpen && (
        <PreviewModal
          schema={schema}
          onClose={() => setIsPreviewOpen(false)}
          onSubmissionRecorded={onSubmissionRecorded}
        />
      )}
    </div>
  );
};

