import React, { useState } from 'react';
import { FormSchema, FormSettings } from '@openform-steps/core';
import { X, Check } from 'lucide-react';

interface FormSettingsModalProps {
  schema: FormSchema;
  onSave: (updated: { title: string; description: string; settings: FormSettings }) => void;
  onClose: () => void;
}

export const FormSettingsModal: React.FC<FormSettingsModalProps> = ({
  schema,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(schema.title);
  const [description, setDescription] = useState(schema.description || '');
  const [settings, setSettings] = useState<FormSettings>(JSON.parse(JSON.stringify(schema.settings)));

  const handleSettingsUpdate = (updates: Partial<FormSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="form-settings-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Form Settings & Theme
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Customize global labels, progress bar, and branding</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form settings"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Form Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Form Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Button Text
              </label>
              <input
                type="text"
                value={settings.nextButtonText || ''}
                onChange={(e) => handleSettingsUpdate({ nextButtonText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Back Button Text
              </label>
              <input
                type="text"
                value={settings.backButtonText || ''}
                onChange={(e) => handleSettingsUpdate({ backButtonText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Submit Button Text
            </label>
            <input
              type="text"
              value={settings.submitButtonText || ''}
              onChange={(e) => handleSettingsUpdate({ submitButtonText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Progress Indicator
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Progress Style</label>
                <select
                  value={settings.progressType || 'bar'}
                  onChange={(e) => handleSettingsUpdate({ progressType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="bar">Linear Bar</option>
                  <option value="steps">Numbered Step Pills</option>
                  <option value="percentage">Percentage Badge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor || '#2563eb'}
                    onChange={(e) => handleSettingsUpdate({ primaryColor: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{settings.primaryColor || '#2563eb'}</span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.allowStepJump)}
                onChange={(e) => handleSettingsUpdate({ allowStepJump: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Allow clicking step pills to navigate between completed steps
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Submission Confirmation
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Confirmation Title</label>
                <input
                  type="text"
                  value={settings.confirmationTitle || ''}
                  onChange={(e) => handleSettingsUpdate({ confirmationTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Confirmation Message</label>
                <textarea
                  rows={2}
                  value={settings.confirmationMessage || ''}
                  onChange={(e) => handleSettingsUpdate({ confirmationMessage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ title, description, settings });
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
