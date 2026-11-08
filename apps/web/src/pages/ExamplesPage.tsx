import React, { useState } from 'react';
import { FormSchema } from '@openform-steps/core';
import { FormRenderer } from '@openform-steps/react';
import { Code, CheckCircle, Sparkles } from 'lucide-react';

export const ExamplesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'controlled' | 'custom_field' | 'branching'>('controlled');

  // Example 1: Controlled values tracker
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);

  const controlledSchema: FormSchema = {
    id: 'example_controlled',
    title: 'Controlled Form State Example',
    version: '1.0.0',
    settings: {
      submitButtonText: 'Complete Example',
      nextButtonText: 'Continue',
      showProgressBar: true,
      progressType: 'bar',
      primaryColor: '#2563eb',
    },
    steps: [
      {
        id: 'step_identity',
        title: 'Step 1: Your Info',
        description: 'Notice how state updates in real-time in the JSON panel beside this form.',
        fields: [
          { id: 'user_name', type: 'text', label: 'Full Name', placeholder: 'e.g. Alex', required: true },
          { id: 'user_email', type: 'email', label: 'Email', placeholder: 'alex@example.com', required: true },
        ],
      },
      {
        id: 'step_feedback',
        title: 'Step 2: Experience',
        description: 'Multi-step state persists automatically across steps.',
        fields: [
          { id: 'satisfaction_rating', type: 'rating', label: 'Rate your onboarding', ratingMax: 5, required: true },
          { id: 'comments', type: 'textarea', label: 'Comments', placeholder: 'Any thoughts...' },
        ],
      },
    ],
  };

  // Example 2: Custom Field (Toggle Switch)
  const customFieldSchema: FormSchema = {
    id: 'example_custom_field',
    title: 'Custom Field Registration Demo',
    version: '1.0.0',
    settings: {
      submitButtonText: 'Submit Configuration',
      primaryColor: '#7c3aed',
      showProgressBar: true,
      progressType: 'percentage',
    },
    steps: [
      {
        id: 'step_toggles',
        title: 'Feature Flags',
        description: 'This step uses a custom Toggle Switch component registered into the FormRenderer.',
        fields: [
          { id: 'beta_access', type: 'checkbox', label: 'Standard Checkbox', options: [{ label: 'Opt in', value: 'opt_in' }] },
          {
            id: 'dark_mode_feature',
            type: 'dropdown',
            label: 'Interface Mode',
            options: [
              { label: 'Auto (System)', value: 'auto' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ],
          },
        ],
      },
    ],
  };

  // Example 3: Branching & Conditional Logic
  const branchingSchema: FormSchema = {
    id: 'example_branching',
    title: 'Conditional Branching Demo',
    version: '1.0.0',
    settings: {
      submitButtonText: 'Finish Assessment',
      primaryColor: '#059669',
      showProgressBar: true,
      progressType: 'steps',
    },
    steps: [
      {
        id: 'step_need_support',
        title: 'Step 1: Needs Analysis',
        description: 'Select "Enterprise High Priority" to reveal the conditional routing step!',
        fields: [
          {
            id: 'support_tier',
            type: 'radio',
            label: 'Which support level does your organization require?',
            required: true,
            options: [
              { label: 'Community Support (Free)', value: 'community' },
              { label: 'Enterprise 24/7 SLA (Paid)', value: 'enterprise' },
            ],
            defaultValue: 'community',
          },
        ],
      },
      {
        id: 'step_enterprise_sla',
        title: 'Step 2: Enterprise SLA Details',
        description: 'This entire step was conditionally revealed because you chose "Enterprise"!',
        condition: {
          action: 'show',
          condition: {
            rules: [{ fieldId: 'support_tier', operator: 'equals', value: 'enterprise' }],
          },
        },
        fields: [
          { id: 'company_sla_rep', type: 'text', label: 'Company Primary Contact Name', required: true },
          { id: 'sla_target_response_hours', type: 'number', label: 'Guaranteed Response SLA (Hours)', required: true, validation: { min: 1, max: 24 } },
        ],
      },
      {
        id: 'step_confirmation',
        title: 'Step 3: Confirmation',
        description: 'Final step reached.',
        fields: [
          { id: 'confirm_agreement', type: 'consent', label: 'Confirm Assessment Details', required: true, defaultValue: false },
        ],
      },
    ],
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive React Examples</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Developer Integration Examples
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Explore working examples demonstrating real-time state tracking, custom field extension, and dynamic conditional branching.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('controlled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'controlled'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          1. Real-Time State Inspection
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom_field')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'custom_field'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          2. Theme & Custom Types
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branching')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'branching'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          3. Multi-Step Branching Logic
        </button>
      </div>

      {/* Example 1: Controlled */}
      {activeTab === 'controlled' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FormRenderer
              schema={controlledSchema}
              onChange={setFormValues}
              onSubmit={(data) => setSubmittedData(data)}
            />
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span>formValues State (Live)</span>
                </span>
                <span className="text-[11px] text-slate-400">Updates as you type</span>
              </div>
              <pre className="font-mono text-xs overflow-x-auto text-emerald-400">
                {JSON.stringify(formValues, null, 2)}
              </pre>
            </div>

            {submittedData && (
              <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Latest onSubmit Event Payload</span>
                </div>
                <pre className="font-mono text-xs overflow-x-auto">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example 2: Custom Field */}
      {activeTab === 'custom_field' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <FormRenderer
            schema={customFieldSchema}
            onSubmit={(data) => alert('Submitted: ' + JSON.stringify(data))}
          />
        </div>
      )}

      {/* Example 3: Branching */}
      {activeTab === 'branching' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <FormRenderer
            schema={branchingSchema}
            onSubmit={(data) => alert('Assessment Complete! ' + JSON.stringify(data))}
          />
        </div>
      )}
    </div>
  );
};
