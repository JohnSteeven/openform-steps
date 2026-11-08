import React, { useState } from 'react';
import { ConditionOperator, FieldConditionRule, FieldSchema, StepSchema } from '@openform-steps/core';
import { X, Check, Plus, Trash2 } from 'lucide-react';

interface StepSettingsModalProps {
  step: StepSchema;
  stepIndex: number;
  allFieldsInForm: FieldSchema[];
  onSave: (updated: StepSchema) => void;
  onClose: () => void;
}

export const StepSettingsModal: React.FC<StepSettingsModalProps> = ({
  step,
  stepIndex,
  allFieldsInForm,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<StepSchema>(JSON.parse(JSON.stringify(step)));

  // Candidate fields from earlier steps
  const candidateFields = allFieldsInForm.filter((f) => f.type !== 'content');

  const handleAddRule = () => {
    const targetFieldId = candidateFields[0]?.id || '';
    const newRule: FieldConditionRule = {
      fieldId: targetFieldId,
      operator: 'equals',
      value: '',
    };

    setDraft((prev) => ({
      ...prev,
      condition: {
        action: prev.condition?.action || 'skip',
        condition: {
          logicalOperator: prev.condition?.condition?.logicalOperator || 'and',
          rules: [...(prev.condition?.condition?.rules || []), newRule],
        },
      },
    }));
  };

  const handleUpdateRule = (idx: number, updates: Partial<FieldConditionRule>) => {
    setDraft((prev) => {
      const rules = [...(prev.condition?.condition?.rules || [])];
      rules[idx] = { ...rules[idx], ...updates };
      return {
        ...prev,
        condition: {
          action: prev.condition?.action || 'skip',
          condition: {
            ...prev.condition?.condition,
            rules,
          },
        },
      };
    });
  };

  const handleRemoveRule = (idx: number) => {
    setDraft((prev) => {
      const rules = [...(prev.condition?.condition?.rules || [])];
      rules.splice(idx, 1);
      return {
        ...prev,
        condition: rules.length > 0
          ? {
              action: prev.condition?.action || 'skip',
              condition: {
                ...prev.condition?.condition,
                rules,
              },
            }
          : undefined,
      };
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="step-settings-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Step {stepIndex + 1} Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure step details and routing rules</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close step settings"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step Title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step Description (Optional)
            </label>
            <textarea
              rows={2}
              value={draft.description || ''}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Conditional Step Navigation
                </span>
                <p className="text-[11px] text-slate-500">
                  Automatically skip or show this step based on prior answers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            {draft.condition?.condition?.rules && draft.condition.condition.rules.length > 0 && (
              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Action:</span>
                  <select
                    value={draft.condition.action}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        condition: {
                          ...p.condition!,
                          action: e.target.value as 'skip' | 'show',
                        },
                      }))
                    }
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="skip">SKIP this step if</option>
                    <option value="show">SHOW this step ONLY if</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {draft.condition.condition.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <select
                        value={rule.fieldId}
                        onChange={(e) => handleUpdateRule(idx, { fieldId: e.target.value })}
                        className="w-full sm:w-36 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        {candidateFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          handleUpdateRule(idx, { operator: e.target.value as ConditionOperator })
                        }
                        className="w-full sm:w-32 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">does not equal</option>
                        <option value="contains">contains</option>
                        <option value="is_empty">is empty</option>
                        <option value="is_not_empty">is not empty</option>
                      </select>

                      {rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && (
                        <input
                          type="text"
                          placeholder="Target value"
                          value={rule.value ?? ''}
                          onChange={(e) => handleUpdateRule(idx, { value: e.target.value })}
                          className="w-full sm:flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        aria-label="Remove condition rule"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              onSave(draft);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Step</span>
          </button>
        </div>
      </div>
    </div>
  );
};
