import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  Shield,
  Zap,
  Globe,
  Check,
  Copy,
} from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeSnippets = {
    install: 'pnpm add @openform-steps/core @openform-steps/react',
    basicUsage: `import React from 'react';
import { FormRenderer } from '@openform-steps/react';
import { FormSchema } from '@openform-steps/core';

const mySchema: FormSchema = {
  id: 'onboarding-form',
  title: 'User Onboarding',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Complete Onboarding',
    showProgressBar: true,
    progressType: 'steps',
    primaryColor: '#2563eb',
  },
  steps: [
    {
      id: 'step_1',
      title: 'Profile',
      description: 'Please introduce yourself',
      fields: [
        { id: 'name', type: 'text', label: 'Full Name', required: true },
        { id: 'email', type: 'email', label: 'Work Email', required: true }
      ]
    },
    {
      id: 'step_2',
      title: 'Preferences',
      fields: [
        {
          id: 'role',
          type: 'dropdown',
          label: 'Primary Role',
          options: [
            { label: 'Engineering', value: 'eng' },
            { label: 'Product Design', value: 'design' }
          ]
        }
      ]
    }
  ]
};

export function App() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submission payload:', data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FormRenderer schema={mySchema} onSubmit={handleSubmit} />
    </div>
  );
}`,
    customField: `import React from 'react';
import { FormRenderer, CustomFieldProps } from '@openform-steps/react';

// Define a custom Toggle Switch component
const CustomToggleField: React.FC<CustomFieldProps> = ({ field, value, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
      <div>
        <div className="font-bold text-sm">{field.label}</div>
        {field.helperText && <div className="text-xs text-slate-500">{field.helperText}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        onClick={() => onChange(!value)}
        className={"w-12 h-6 rounded-full transition-colors " + (value ? 'bg-blue-600' : 'bg-slate-300')}
      >
        <div className={"w-5 h-5 bg-white rounded-full transition-transform " + (value ? 'translate-x-6' : 'translate-x-0.5')} />
      </button>
    </div>
  );
};

// Register custom fields in renderer
<FormRenderer
  schema={schema}
  customFields={{
    toggle: CustomToggleField
  }}
  onSubmit={handleSubmit}
/>;`,
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Developer Guide & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          OpenForm Steps Documentation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          The modern, accessible, open-source multi-step form library and builder for React 19, TypeScript, and Vite.
        </p>
      </div>

      <div className="space-y-12">
        {/* Monorepo Architecture */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Monorepo Package Architecture
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            OpenForm Steps is organized as independent, modular npm packages so developers can adopt only what they need without bloat:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                @openform-steps/core
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero UI runtime dependencies. Pure TypeScript schema types, Zod validators, AST condition evaluator, multi-step state machine, and chunked CSV/JSON streaming processors.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                @openform-steps/react
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The high-performance, WCAG 2.2 AA compliant React renderer component with built-in accessibility, error summary autofocus, responsive step navigation, and custom field registry.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                @openform-steps/builder
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Visual drag-and-drop form editor with keyboard-accessible move alternatives, undo/redo state history, field property inspector, and live schema export.
              </p>
            </div>
          </div>
        </section>

        {/* Quickstart Installation */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Installation & Quick Start
            </h2>
          </div>

          <div className="relative mb-4">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              <code>{codeSnippets.install}</code>
            </pre>
            <button
              type="button"
              onClick={() => handleCopy('install', codeSnippets.install)}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'install' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[380px]">
              <code>{codeSnippets.basicUsage}</code>
            </pre>
            <button
              type="button"
              onClick={() => handleCopy('basic', codeSnippets.basicUsage)}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'basic' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'basic' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </section>

        {/* High Performance and Scalability Architecture */}
        <section className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              High Performance & Scalable Edge Architecture
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            OpenForm Steps is designed to minimize origin server load and maintain fast, responsive interaction:
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Client-First Execution & CDN Distribution:</strong>{' '}
                Core validation, condition evaluation, and step state transitions execute directly inside the browser sandbox, allowing static assets to be cached across global CDN edge locations.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Route-Based Code Splitting & Manual Chunking:</strong>{' '}
                The builder workspace, template gallery, response inspector, and docs are lazily loaded. Initial bundle delivery for the renderer is minimized to under 35 kB gzipped.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Chunked Main-Thread Data Exporting:</strong>{' '}
                Exporting large batches of submissions into CSV utilizes cooperative time-slicing (`chunkedCsvExport`), ensuring Interaction to Next Paint (INP) remains below 200ms without freezing mobile screens.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Production Backend Blueprint:</strong>{' '}
                For centralized multi-user submission collection, connect stateless edge functions behind token bucket rate limiters, write submissions asynchronously to message queues (Kafka / SQS / BullMQ), and persist to distributed databases with indexed `(form_id, submitted_at)`.
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Specification */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              WCAG 2.2 AA Accessibility Compliance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Every component in OpenForm Steps is vetted against strict accessibility criteria:
          </p>

          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li><strong>Keyboard-First Navigation:</strong> Complete form completion without mouse interaction, with sensible Tab order and focus management on step changes.</li>
            <li><strong>Error Summary & ARIA Live:</strong> On submission with errors, focus moves to the top <code className="font-mono text-rose-600">&lt;ErrorSummary /&gt;</code> alert with anchor links jumping to the specific invalid fields.</li>
            <li><strong>Touch Target Sizing:</strong> All buttons, inputs, radios, checkboxes, and rating stars meet or exceed the 44×44px WCAG 2.2 target criteria.</li>
            <li><strong>Reduced Motion Support:</strong> Respects the user's operating system <code className="font-mono">prefers-reduced-motion</code> setting by disabling non-essential transitions.</li>
            <li><strong>Accessible Drag-and-Drop:</strong> Builder fields provide explicit Move Up and Move Down buttons alongside mouse drag handles.</li>
          </ul>
        </section>

        {/* Custom Field Registration */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Custom Field Registration
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Extend the renderer with your own custom input widgets (e.g. signature pad, slider, file uploader) using the <code className="font-mono text-blue-600">customFields</code> prop:
          </p>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[350px]">
              <code>{codeSnippets.customField}</code>
            </pre>
            <button
              type="button"
              onClick={() => handleCopy('custom', codeSnippets.customField)}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'custom' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'custom' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
