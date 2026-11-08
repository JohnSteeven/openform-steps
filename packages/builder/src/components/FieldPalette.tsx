import React from 'react';
import { FieldType } from '@openform-steps/core';
import {
  Type,
  Mail,
  Hash,
  Phone,
  Calendar,
  AlignLeft,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  Star,
  ShieldCheck,
  Heading,
} from 'lucide-react';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

interface PaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'text', label: 'Short Text', description: 'Single line text input', icon: Type },
  { type: 'email', label: 'Email Address', description: 'Validated email field', icon: Mail },
  { type: 'number', label: 'Number', description: 'Numeric input with range', icon: Hash },
  { type: 'phone', label: 'Phone Number', description: 'International telephone input', icon: Phone },
  { type: 'date', label: 'Date Picker', description: 'Calendar date selection', icon: Calendar },
  { type: 'textarea', label: 'Long Text', description: 'Multi-line message or notes', icon: AlignLeft },
  { type: 'dropdown', label: 'Dropdown Select', description: 'Single choice select menu', icon: ChevronDownSquare },
  { type: 'radio', label: 'Radio Choices', description: 'Single choice radio options', icon: CircleDot },
  { type: 'checkbox', label: 'Checkboxes', description: 'Multi-select options list', icon: CheckSquare },
  { type: 'rating', label: 'Star Rating', description: '1-5 star or score review', icon: Star },
  { type: 'consent', label: 'Consent & Terms', description: 'Agreement acknowledgment', icon: ShieldCheck },
  { type: 'content', label: 'Section Header', description: 'Title and descriptive text', icon: Heading },
];

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField }) => {
  return (
    <aside
      aria-label="Add Form Fields"
      className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Field Library
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Click any field to add it to the active step.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onAddField(item.type)}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105 transition-all shadow-xs shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden lg:block">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

