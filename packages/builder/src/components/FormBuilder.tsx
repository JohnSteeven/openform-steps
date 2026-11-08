import React, { useState, useEffect } from 'react';
import {
  FormSchema,
  FieldSchema,
  StepSchema,
  FieldType,
  createDefaultField,
  createDefaultStep,
} from '@openform-steps/core';
import { ConfirmationDialog } from '@openform-steps/react';
import { useHistory } from '../hooks/useHistory';
import { FieldPalette } from './FieldPalette';
import { FieldCanvasItem } from './FieldCanvasItem';
import { FieldPropertiesModal } from './FieldPropertiesModal';
import { StepSettingsModal } from './StepSettingsModal';
import { FormSettingsModal } from './FormSettingsModal';
import { ImportExportModal } from './ImportExportModal';
import {
  Undo,
  Redo,
  Settings,
  Code2,
  Plus,
  Eye,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface FormBuilderProps {
  initialSchema: FormSchema;
  onChange?: (schema: FormSchema) => void;
  onPreviewToggle?: () => void;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSchema,
  onChange,
  onPreviewToggle,
  className,
}) => {
  const { state: schema, set: setSchema, undo, redo, canUndo, canRedo } = useHistory(initialSchema);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [editingField, setEditingField] = useState<FieldSchema | null>(null);
  const [editingStep, setEditingStep] = useState<StepSchema | null>(null);
  const [isFormSettingsOpen, setIsFormSettingsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [stepToDeleteIndex, setStepToDeleteIndex] = useState<number | null>(null);
  const [stepAlertMessage, setStepAlertMessage] = useState<string | null>(null);

  // Notify parent on changes
  useEffect(() => {
    onChange?.(schema);
  }, [schema, onChange]);

  // Keyboard shortcuts for Undo and Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Ensure active step index is valid
  const currentStep = schema.steps[activeStepIndex] || schema.steps[0];
  const safeStepIndex = Math.min(activeStepIndex, Math.max(0, schema.steps.length - 1));

  // Collect all fields across all steps for conditional target lookups
  const allFields = React.useMemo(() => {
    return schema.steps.flatMap((s) => s.fields);
  }, [schema]);

  // Step operations
  const handleAddStep = () => {
    const newStep = createDefaultStep(schema.steps.length + 1);
    setSchema((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
      updatedAt: new Date().toISOString(),
    }));
    setActiveStepIndex(schema.steps.length);
  };

  const handleRequestDeleteStep = (stepIdx: number) => {
    if (schema.steps.length <= 1) {
      setStepAlertMessage('A form must have at least one step.');
      return;
    }
    setStepToDeleteIndex(stepIdx);
  };

  const handleConfirmDeleteStep = () => {
    if (stepToDeleteIndex === null) return;
    const targetIdx = stepToDeleteIndex;
    setSchema((prev) => {
      const nextSteps = prev.steps.filter((_, i) => i !== targetIdx);
      return {
        ...prev,
        steps: nextSteps,
        updatedAt: new Date().toISOString(),
      };
    });
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
    setStepToDeleteIndex(null);
  };

  const handleMoveStep = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= schema.steps.length) return;
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const [moved] = nextSteps.splice(fromIdx, 1);
      nextSteps.splice(toIdx, 0, moved);
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
    setActiveStepIndex(toIdx);
  };

  const handleUpdateStep = (updatedStep: StepSchema) => {
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[safeStepIndex] = updatedStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  // Field operations
  const handleAddField = (type: FieldType) => {
    const newField = createDefaultField(type);
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const targetStep = { ...nextSteps[safeStepIndex] };
      targetStep.fields = [...targetStep.fields, newField];
      nextSteps[safeStepIndex] = targetStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  const handleUpdateField = (updatedField: FieldSchema) => {
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const targetStep = { ...nextSteps[safeStepIndex] };
      targetStep.fields = targetStep.fields.map((f) => (f.id === updatedField.id ? updatedField : f));
      nextSteps[safeStepIndex] = targetStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  const handleDuplicateField = (fieldIdx: number) => {
    const sourceField = currentStep.fields[fieldIdx];
    if (!sourceField) return;

    const duplicate: FieldSchema = {
      ...JSON.parse(JSON.stringify(sourceField)),
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `${sourceField.label} (Copy)`,
    };

    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const targetStep = { ...nextSteps[safeStepIndex] };
      const nextFields = [...targetStep.fields];
      nextFields.splice(fieldIdx + 1, 0, duplicate);
      targetStep.fields = nextFields;
      nextSteps[safeStepIndex] = targetStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  const handleDeleteField = (fieldIdx: number) => {
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const targetStep = { ...nextSteps[safeStepIndex] };
      targetStep.fields = targetStep.fields.filter((_, i) => i !== fieldIdx);
      nextSteps[safeStepIndex] = targetStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  const handleMoveField = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= currentStep.fields.length) return;
    setSchema((prev) => {
      const nextSteps = [...prev.steps];
      const targetStep = { ...nextSteps[safeStepIndex] };
      const nextFields = [...targetStep.fields];
      const [moved] = nextFields.splice(fromIdx, 1);
      nextFields.splice(toIdx, 0, moved);
      targetStep.fields = nextFields;
      nextSteps[safeStepIndex] = targetStep;
      return { ...prev, steps: nextSteps, updatedAt: new Date().toISOString() };
    });
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedFieldIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedFieldIndex !== null && draggedFieldIndex !== targetIdx) {
      handleMoveField(draggedFieldIndex, targetIdx);
    }
    setDraggedFieldIndex(null);
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className || ''}`}>
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <input
            type="text"
            value={schema.title}
            onChange={(e) =>
              setSchema((prev) => ({
                ...prev,
                title: e.target.value,
                updatedAt: new Date().toISOString(),
              }))
            }
            aria-label="Form title"
            className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:outline-none transition-colors px-1"
          />
          <p className="text-xs text-slate-500 pl-1 mt-0.5">
            {schema.steps.length} {schema.steps.length === 1 ? 'step' : 'steps'} • {allFields.length} total fields
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last change"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo last change"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => setIsFormSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>JSON</span>
          </button>

          {onPreviewToggle && (
            <button
              type="button"
              onClick={onPreviewToggle}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer ml-1"
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Step navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {schema.steps.map((step, idx) => {
          const isActive = idx === safeStepIndex;
          const isFirst = idx === 0;
          const isLast = idx === schema.steps.length - 1;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
              onClick={() => setActiveStepIndex(idx)}
            >
              {schema.steps.length > 1 && (
                <div className="flex items-center gap-0.5 mr-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMoveStep(idx, idx - 1)}
                    title="Move step left"
                    aria-label={`Move step ${idx + 1} left`}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMoveStep(idx, idx + 1)}
                    title="Move step right"
                    aria-label={`Move step ${idx + 1} right`}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span>{idx + 1}.</span>
              <span className="max-w-[120px] truncate">{step.title}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {step.fields.length}
              </span>
              {schema.steps.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestDeleteStep(idx);
                  }}
                  title="Delete step"
                  aria-label={`Delete step ${idx + 1}`}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddStep}
          className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:border-blue-500 hover:bg-blue-50/30 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Step</span>
        </button>
      </div>

      {/* Main workspace layout: Palette on side, Canvas in center */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FieldPalette onAddField={handleAddField} />

        <div className="flex-1 w-full bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 min-h-[500px] flex flex-col">
          {/* Step settings header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{currentStep.title}</span>
                {currentStep.condition && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-medium">
                    Conditional routing active
                  </span>
                )}
              </h2>
              {currentStep.description && (
                <p className="text-xs text-slate-500 mt-0.5">{currentStep.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEditingStep(currentStep)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Step Settings</span>
            </button>
          </div>

          {/* Fields Canvas */}
          {currentStep.fields.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                This step is currently empty
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Click any field on the left library to add questions or section headings to this step.
              </p>
              <button
                type="button"
                onClick={() => handleAddField('text')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Field</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentStep.fields.map((field, idx) => (
                <FieldCanvasItem
                  key={field.id}
                  field={field}
                  index={idx}
                  totalFields={currentStep.fields.length}
                  onEdit={() => setEditingField(field)}
                  onDuplicate={() => handleDuplicateField(idx)}
                  onDelete={() => handleDeleteField(idx)}
                  onMoveUp={() => handleMoveField(idx, idx - 1)}
                  onMoveDown={() => handleMoveField(idx, idx + 1)}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingField && (
        <FieldPropertiesModal
          field={editingField}
          allFieldsInForm={allFields}
          onSave={handleUpdateField}
          onClose={() => setEditingField(null)}
        />
      )}

      {editingStep && (
        <StepSettingsModal
          step={editingStep}
          stepIndex={safeStepIndex}
          allFieldsInForm={allFields}
          onSave={handleUpdateStep}
          onClose={() => setEditingStep(null)}
        />
      )}

      {isFormSettingsOpen && (
        <FormSettingsModal
          schema={schema}
          onSave={({ title, description, settings }) => {
            setSchema((prev) => ({
              ...prev,
              title,
              description,
              settings,
              updatedAt: new Date().toISOString(),
            }));
          }}
          onClose={() => setIsFormSettingsOpen(false)}
        />
      )}

      {isImportExportOpen && (
        <ImportExportModal
          schema={schema}
          onImport={(imported) => {
            setSchema(imported);
            setActiveStepIndex(0);
          }}
          onClose={() => setIsImportExportOpen(false)}
        />
      )}

      {/* Accessible Step Deletion Dialog */}
      <ConfirmationDialog
        isOpen={stepToDeleteIndex !== null}
        title="Delete Form Step"
        description={`Are you sure you want to delete Step ${(stepToDeleteIndex ?? 0) + 1} ("${schema.steps[stepToDeleteIndex ?? 0]?.title}")? All fields inside this step will be removed.`}
        confirmLabel="Delete Step"
        cancelLabel="Keep Step"
        variant="danger"
        onConfirm={handleConfirmDeleteStep}
        onCancel={() => setStepToDeleteIndex(null)}
      />

      {/* Accessible Minimum Step Alert */}
      <ConfirmationDialog
        isOpen={stepAlertMessage !== null}
        title="Step Action Not Allowed"
        description={stepAlertMessage || ''}
        confirmLabel="Understood"
        cancelLabel="Close"
        variant="info"
        onConfirm={() => setStepAlertMessage(null)}
        onCancel={() => setStepAlertMessage(null)}
      />
    </div>
  );
};
