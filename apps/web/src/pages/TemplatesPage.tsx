import React, { useState, useMemo } from 'react';
import { FormSchema } from '@openform-steps/core';
import { ConfirmationDialog } from '@openform-steps/react';
import { ALL_TEMPLATES, TemplateMetadata } from '../templates';
import { PreviewModal } from './PreviewModal';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Search,
  X,
  FileText,
  Clock,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface TemplatesPageProps {
  onSelectTemplate: (schema: FormSchema) => void;
  onSubmissionRecorded?: () => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  onSelectTemplate,
  onSubmissionRecorded,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewingSchema, setPreviewingSchema] = useState<FormSchema | null>(null);
  const [templateToApply, setTemplateToApply] = useState<TemplateMetadata | null>(null);
  const { showToast } = useToast();

  const categories = ['All', 'Feedback', 'HR & Recruiting', 'Events', 'Healthcare', 'Sales & B2B', 'IT Support'];

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_TEMPLATES.length };
    categories.slice(1).forEach((cat) => {
      counts[cat] = ALL_TEMPLATES.filter((t) => t.category === cat).length;
    });
    return counts;
  }, [categories]);

  // Filter templates by category and search query
  const filtered = useMemo(() => {
    return ALL_TEMPLATES.filter((tmpl) => {
      const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const inName = tmpl.name.toLowerCase().includes(q);
      const inDesc = tmpl.description.toLowerCase().includes(q);
      const inCategory = tmpl.category.toLowerCase().includes(q);
      const inFields = tmpl.schema.steps.some((s) =>
        s.fields.some((f) => f.label.toLowerCase().includes(q) || f.type.toLowerCase().includes(q))
      );

      return inName || inDesc || inCategory || inFields;
    });
  }, [selectedCategory, searchQuery]);

  const handleConfirmApplyTemplate = () => {
    if (!templateToApply) return;
    onSelectTemplate(templateToApply.schema);
    showToast(
      'Template Loaded',
      `"${templateToApply.name}" has been loaded into your visual builder.`,
      'success'
    );
    setTemplateToApply(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-200 dark:border-blue-900">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Ready Blueprints</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Form Template Gallery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed max-w-2xl mx-auto">
          Pre-built, accessible multi-step workflows designed with real-world validation rules, conditional branch logic, and responsive layouts.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, keyword, or field type..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No templates match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6">
            We couldn't find any blueprints matching "{searchQuery}" in category "{selectedCategory}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tmpl) => {
            const totalFields = tmpl.schema.steps.reduce((acc, s) => acc + s.fields.length, 0);

            return (
              <div
                key={tmpl.id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all group relative"
              >
                <div>
                  {/* Top metadata pill row */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {tmpl.category}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tmpl.stepsCount} steps</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{Math.max(1, Math.round(totalFields * 0.3))} min</span>
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 tracking-tight">
                    {tmpl.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {tmpl.description}
                  </p>

                  {/* Field types summary tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tmpl.schema.steps.flatMap((s) => s.fields).slice(0, 4).map((f) => (
                      <span
                        key={f.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
                      >
                        {f.type}
                      </span>
                    ))}
                    {totalFields > 4 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                        +{totalFields - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreviewingSchema(tmpl.schema)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateToApply(tmpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer group-hover:bg-blue-600"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Template Application Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={templateToApply !== null}
        title="Load Form Template"
        description={`Loading "${templateToApply?.name}" will replace your current form draft in the builder. Any unsaved edits to the current draft will be overwritten.`}
        confirmLabel="Load Template"
        cancelLabel="Keep Current Draft"
        variant="warning"
        onConfirm={handleConfirmApplyTemplate}
        onCancel={() => setTemplateToApply(null)}
      />

      {/* Live Preview Modal */}
      {previewingSchema && (
        <PreviewModal
          schema={previewingSchema}
          onClose={() => setPreviewingSchema(null)}
          onSubmissionRecorded={onSubmissionRecorded}
        />
      )}
    </div>
  );
};
