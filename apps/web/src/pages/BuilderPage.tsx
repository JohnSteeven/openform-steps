import React, { useState, useEffect } from 'react';
import { FormSchema } from '@openform-steps/core';
import { FormBuilder } from '@openform-steps/builder';
import { ConfirmationDialog } from '@openform-steps/react';
import {
  getAllForms,
  saveForm,
  createNewForm,
  duplicateForm,
  deleteForm,
  setActiveFormId,
  FormRecord,
} from '../storage/form-manager';
import { PreviewModal } from './PreviewModal';
import { PublishModal } from '../components/PublishModal';
import { setCloudFormStatus } from '../api/client';
import {
  CheckCircle2,
  CloudOff,
  Eye,
  Globe,
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/Toast';

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
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [formsList, setFormsList] = useState<FormRecord[]>([]);
  const { showToast } = useToast();

  // Load forms index
  const refreshForms = () => {
    setFormsList(getAllForms());
  };

  useEffect(() => {
    refreshForms();
  }, [schema]);

  // Debounced auto-save to multi-form storage
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveForm(schema);
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [schema]);

  const handleCreateNewForm = () => {
    const fresh = createNewForm('Untitled Form');
    onSchemaChange(fresh);
    setIsFormMenuOpen(false);
    refreshForms();
    showToast('New Form Created', 'A blank form has been initialized in your workspace.', 'success');
  };

  const handleDuplicateCurrentForm = () => {
    const duplicated = duplicateForm(schema.id);
    onSchemaChange(duplicated);
    setIsFormMenuOpen(false);
    refreshForms();
    showToast('Form Duplicated', `Created copy: "${duplicated.title}".`, 'success');
  };

  const handleConfirmDeleteCurrentForm = () => {
    const nextForm = deleteForm(schema.id);
    onSchemaChange(nextForm);
    setIsDeleteModalOpen(false);
    setIsFormMenuOpen(false);
    refreshForms();
    showToast('Form Deleted', 'The form was removed from your local workspace.', 'info');
  };

  const handleSwitchForm = (selected: FormRecord) => {
    setActiveFormId(selected.id);
    onSchemaChange(selected.schema);
    setIsFormMenuOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Sub-header info banner with Form Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Form Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFormMenuOpen(!isFormMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer transition-colors"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="max-w-[180px] sm:max-w-[240px] truncate">{schema.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isFormMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 z-40 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Forms in Workspace ({formsList.length})
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 mb-2">
                  {formsList.map((f) => {
                    const isActive = f.id === schema.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSwitchForm(f)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{f.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {f.stepsCount} steps
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={handleCreateNewForm}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Blank Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateCurrentForm}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate This Form</span>
                  </button>

                  {formsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete This Form</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
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
        </div>

        {/* Primary toolbar actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Publish & Share</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
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

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <PreviewModal
          schema={schema}
          onClose={() => setIsPreviewOpen(false)}
          onSubmissionRecorded={onSubmissionRecorded}
        />
      )}

      {/* Publish & Share Modal */}
      {isPublishOpen && (
        <PublishModal
          isOpen={true}
          schema={schema}
          status="published"
          onClose={() => setIsPublishOpen(false)}
          onUpdatePublishSettings={async (_settings) => {
            saveForm({
              ...schema,
              updatedAt: new Date().toISOString(),
            });
            try {
              await setCloudFormStatus(schema.id, _settings.status);
            } catch {
              // Local only form, ignore
            }
            showToast('Form Settings Updated', `Form is now ${_settings.status.toUpperCase()}.`, 'success');
          }}
        />
      )}

      {/* Accessible Delete Form Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        title="Delete Form"
        description={`Are you sure you want to delete "${schema.title}"? This will permanently remove the form from your local workspace.`}
        confirmLabel="Delete Form"
        cancelLabel="Keep Form"
        variant="danger"
        onConfirm={handleConfirmDeleteCurrentForm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
