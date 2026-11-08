import React, { useState } from 'react';
import {
  ConditionOperator,
  FieldConditionRule,
  FieldSchema,
  SelectOption,
} from '@openform-steps/core';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface FieldPropertiesModalProps {
  field: FieldSchema;
  allFieldsInForm: FieldSchema[];
  onSave: (updated: FieldSchema) => void;
  onClose: () => void;
}

export const FieldPropertiesModal: React.FC<FieldPropertiesModalProps> = ({
  field,
  allFieldsInForm,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'validation' | 'conditions'>('general');
  const [draft, setDraft] = useState<FieldSchema>(JSON.parse(JSON.stringify(field)));

  // Available target fields for conditional rules (exclude current field to avoid cyclic dependencies)
  const availableTargetFields = allFieldsInForm.filter((f) => f.id !== field.id && f.type !== 'content');

  const handleUpdate = (updates: Partial<FieldSchema>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const handleValidationUpdate = (updates: any) => {
    setDraft((prev) => ({
      ...prev,
      validation: { ...prev.validation, ...updates },
    }));
  };

  // Option list helpers
  const handleAddOption = () => {
    const currentOpts: SelectOption[] = draft.options || [];
    const count = currentOpts.length + 1;
    handleUpdate({
      options: [...currentOpts, { label: `Choice ${count}`, value: `choice_${count}` }],
    });
  };

  const handleUpdateOption = (index: number, key: 'label' | 'value', val: string) => {
    const currentOpts = [...(draft.options || [])];
    currentOpts[index] = { ...currentOpts[index], [key]: val };
    handleUpdate({ options: currentOpts });
  };

  const handleRemoveOption = (index: number) => {
    const currentOpts = [...(draft.options || [])];
    currentOpts.splice(index, 1);
    handleUpdate({ options: currentOpts });
  };

  // Condition rule helpers
  const handleAddConditionRule = () => {
    const targetFieldId = availableTargetFields[0]?.id || '';
    const newRule: FieldConditionRule = {
      fieldId: targetFieldId,
      operator: 'equals',
      value: '',
    };
    const currentRules = draft.visibilityCondition?.rules || [];
    handleUpdate({
      visibilityCondition: {
        logicalOperator: draft.visibilityCondition?.logicalOperator || 'and',
        rules: [...currentRules, newRule],
      },
    });
  };

  const handleUpdateConditionRule = (idx: number, updates: Partial<FieldConditionRule>) => {
    const currentRules = [...(draft.visibilityCondition?.rules || [])];
    currentRules[idx] = { ...currentRules[idx], ...updates };
    handleUpdate({
      visibilityCondition: {
        logicalOperator: draft.visibilityCondition?.logicalOperator || 'and',
        rules: currentRules,
      },
    });
  };

  const handleRemoveConditionRule = (idx: number) => {
    const currentRules = [...(draft.visibilityCondition?.rules || [])];
    currentRules.splice(idx, 1);
    handleUpdate({
      visibilityCondition: currentRules.length > 0
        ? {
            logicalOperator: draft.visibilityCondition?.logicalOperator || 'and',
            rules: currentRules,
          }
        : undefined,
    });
  };

  const hasOptions = draft.type === 'dropdown' || draft.type === 'radio' || draft.type === 'checkbox';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Field Settings: {draft.label || draft.id}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Type: {draft.type}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            General
          </button>
          {hasOptions && (
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'options'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Choices ({draft.options?.length || 0})
            </button>
          )}
          {draft.type !== 'content' && (
            <button
              type="button"
              onClick={() => setActiveTab('validation')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'validation'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Validation
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'conditions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Visibility Rules ({draft.visibilityCondition?.rules?.length || 0})
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {draft.type === 'content' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={draft.contentHeading || ''}
                      onChange={(e) => handleUpdate({ contentHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Explanatory Text
                    </label>
                    <textarea
                      rows={3}
                      value={draft.contentText || ''}
                      onChange={(e) => handleUpdate({ contentText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={draft.label}
                      onChange={(e) => handleUpdate({ label: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={draft.placeholder || ''}
                      onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Help / Instructions Text
                    </label>
                    <input
                      type="text"
                      value={draft.helperText || ''}
                      onChange={(e) => handleUpdate({ helperText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  {draft.type === 'rating' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Maximum Rating
                        </label>
                        <select
                          value={draft.ratingMax || 5}
                          onChange={(e) => handleUpdate({ ratingMax: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        >
                          <option value={3}>3 Stars</option>
                          <option value={5}>5 Stars</option>
                          <option value={10}>10 Scale</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Rating Icon
                        </label>
                        <select
                          value={draft.ratingIcon || 'star'}
                          onChange={(e) => handleUpdate({ ratingIcon: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        >
                          <option value="star">Star</option>
                          <option value="heart">Heart</option>
                          <option value="thumb">Thumbs Up</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.required)}
                      onChange={(e) => handleUpdate({ required: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Mark as Required Field
                      </span>
                      <p className="text-[11px] text-slate-500">
                        User cannot proceed to the next step without completing this field.
                      </p>
                    </div>
                  </label>
                </>
              )}
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Manage Options
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Choice</span>
                </button>
              </div>

              {draft.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt.label}
                    placeholder="Choice label"
                    onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={opt.value}
                    placeholder="Value (id)"
                    onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                    className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-mono bg-white dark:bg-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    aria-label={`Remove option ${opt.label}`}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              {(draft.type === 'text' || draft.type === 'textarea') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Min Characters
                    </label>
                    <input
                      type="number"
                      value={draft.validation?.minLength ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate({
                          minLength: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Max Characters
                    </label>
                    <input
                      type="number"
                      value={draft.validation?.maxLength ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate({
                          maxLength: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              )}

              {draft.type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Minimum Value
                    </label>
                    <input
                      type="number"
                      value={draft.validation?.min ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate({
                          min: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Maximum Value
                    </label>
                    <input
                      type="number"
                      value={draft.validation?.max ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate({
                          max: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Validation Error Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please provide your business email address."
                  value={draft.validation?.customMessage || ''}
                  onChange={(e) =>
                    handleValidationUpdate({
                      customMessage: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
                Show or hide this field dynamically based on answers given in previous or current questions.
              </div>

              {availableTargetFields.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No other fields available in the form to compare against.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Visibility Conditions
                    </span>
                    <button
                      type="button"
                      onClick={handleAddConditionRule}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  {draft.visibilityCondition?.rules && draft.visibilityCondition.rules.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Match:</span>
                      <select
                        value={draft.visibilityCondition.logicalOperator || 'and'}
                        onChange={(e) =>
                          handleUpdate({
                            visibilityCondition: {
                              ...draft.visibilityCondition!,
                              logicalOperator: e.target.value as 'and' | 'or',
                            },
                          })
                        }
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                      >
                        <option value="and">ALL rules (AND)</option>
                        <option value="or">ANY rule (OR)</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    {draft.visibilityCondition?.rules?.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-2"
                      >
                        <select
                          value={rule.fieldId}
                          onChange={(e) => handleUpdateConditionRule(idx, { fieldId: e.target.value })}
                          className="w-full sm:w-40 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        >
                          {availableTargetFields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            handleUpdateConditionRule(idx, {
                              operator: e.target.value as ConditionOperator,
                            })
                          }
                          className="w-full sm:w-32 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        >
                          <option value="equals">equals</option>
                          <option value="not_equals">does not equal</option>
                          <option value="contains">contains</option>
                          <option value="not_contains">does not contain</option>
                          <option value="is_empty">is empty</option>
                          <option value="is_not_empty">is not empty</option>
                          <option value="greater_than">greater than</option>
                          <option value="less_than">less than</option>
                        </select>

                        {rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && (
                          <input
                            type="text"
                            placeholder="Value"
                            value={rule.value ?? ''}
                            onChange={(e) => handleUpdateConditionRule(idx, { value: e.target.value })}
                            className="w-full sm:flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveConditionRule(idx)}
                          aria-label="Remove condition rule"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
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
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
