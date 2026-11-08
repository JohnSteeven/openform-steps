import React from 'react';
import { FieldSchema } from '@openform-steps/core';
import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  EyeOff,
} from 'lucide-react';

interface FieldCanvasItemProps {
  field: FieldSchema;
  index: number;
  totalFields: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FieldCanvasItem: React.FC<FieldCanvasItemProps> = ({
  field,
  index,
  totalFields,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isFirst = index === 0;
  const isLast = index === totalFields - 1;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag handle */}
        <div
          title="Drag to reorder"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-hidden="true"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {field.label || (field.type === 'content' ? field.contentHeading : 'Untitled Field')}
            </span>
            {field.required && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold">
                Required
              </span>
            )}
            {field.visibilityCondition && field.visibilityCondition.rules.length > 0 && (
              <span
                title="This field has conditional visibility rules"
                className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium"
              >
                <EyeOff className="w-3 h-3" />
                <span>Conditional</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
              {field.type}
            </span>
            {field.placeholder && (
              <span className="truncate max-w-[200px] text-slate-400">
                "{field.placeholder}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action toolbar */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
        {/* Accessible reorder buttons */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          aria-label={`Move ${field.label} up`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          aria-label={`Move ${field.label} down`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Edit Button */}
        <button
          type="button"
          onClick={onEdit}
          title="Configure field settings"
          aria-label={`Edit ${field.label} settings`}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        {/* Duplicate Button */}
        <button
          type="button"
          onClick={onDuplicate}
          title="Duplicate field"
          aria-label={`Duplicate ${field.label}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={onDelete}
          title="Delete field"
          aria-label={`Delete ${field.label}`}
          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

