import React, { useState } from 'react';
import { FormSchema } from '@openform-steps/core';
import { ALL_TEMPLATES, TemplateMetadata } from '../templates';
import { PreviewModal } from './PreviewModal';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface TemplatesPageProps {
  onSelectTemplate: (schema: FormSchema) => void;
  onSubmissionRecorded?: () => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  onSelectTemplate,
  onSubmissionRecorded,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewingSchema, setPreviewingSchema] = useState<FormSchema | null>(null);

  const categories = ['All', 'Feedback', 'HR & Recruiting', 'Events', 'Healthcare', 'Sales & B2B', 'IT Support'];

  const filtered = selectedCategory === 'All'
    ? ALL_TEMPLATES
    : ALL_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (template: TemplateMetadata) => {
    if (confirm(`Load the "${template.name}" template into the builder? This will replace your current draft.`)) {
      onSelectTemplate(template.schema);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Ready Blueprints</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Form Template Gallery
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Pre-configured, accessible multi-step workflows with real-world validation rules, conditional branch logic, and WCAG AA design.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {tmpl.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{tmpl.stepsCount} steps</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                {tmpl.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {tmpl.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewingSchema(tmpl.schema)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => handleUseTemplate(tmpl)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
