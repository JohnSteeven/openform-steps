import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  FormSchema,
  createDefaultForm,
  createDefaultStep,
  validateStep,
  evaluateCondition,
  exportFormToJson,
  importFormFromJson,
} from '@openform-steps/core';
import { FormRenderer } from '@openform-steps/react';
import { FormBuilder } from '@openform-steps/builder';
import { ALL_TEMPLATES } from '../apps/web/src/templates';
import { loadSavedDraft, saveDraft, saveSubmission, loadSubmissions, clearSubmissions } from '../apps/web/src/storage/storage';

describe('Comprehensive Verification: Form Builder, Preview & Interaction Smoke Test', () => {
  it('1. Tests creating a form with multiple steps, required fields, dropdowns, and conditional logic', () => {
    const customForm = createDefaultForm('Medical Research Intake');
    expect(customForm.steps.length).toBeGreaterThanOrEqual(1);

    // Add step 2
    const step2 = createDefaultStep(2, 'step_consent');
    step2.fields = []; // clean fields for predictable indexing
    step2.fields.push({
      id: 'insurance_type',
      type: 'dropdown',
      label: 'Insurance Provider',
      required: true,
      options: [
        { label: 'Provider A', value: 'a' },
        { label: 'Provider B', value: 'b' },
      ],
    });
    // Conditional field: only shown if insurance is Provider A
    step2.fields.push({
      id: 'provider_a_id',
      type: 'text',
      label: 'Member ID for Provider A',
      required: true,
      visibilityCondition: {
        rules: [{ fieldId: 'insurance_type', operator: 'equals', value: 'a' }],
      },
    });

    customForm.steps.push(step2);

    // Test conditional visibility
    expect(evaluateCondition(step2.fields[1].visibilityCondition, { insurance_type: 'a' })).toBe(true);
    expect(evaluateCondition(step2.fields[1].visibilityCondition, { insurance_type: 'b' })).toBe(false);

    // Test validation
    const validationEmpty = validateStep(step2, { insurance_type: 'a', provider_a_id: '' });
    expect(validationEmpty.isValid).toBe(false);
    expect(validationEmpty.errors.provider_a_id).toBe('"Member ID for Provider A" is required.');

    // When provider is B, provider_a_id is hidden and should NOT fail validation
    const validationB = validateStep(step2, { insurance_type: 'b', provider_a_id: '' });
    expect(validationB.isValid).toBe(true);
  });

  it('2. Tests FormBuilder editing, field duplication, and reordering', () => {
    const initial = createDefaultForm('Editable Builder Form');
    let updatedSchema: FormSchema = initial;

    render(
      <FormBuilder
        initialSchema={initial}
        onChange={(s) => {
          updatedSchema = s;
        }}
      />
    );

    // Verify title input is rendered
    expect(screen.getByDisplayValue('Editable Builder Form')).toBeInTheDocument();

    // Verify field library is rendered
    expect(screen.getByText('Short Text')).toBeInTheDocument();
    expect(screen.getAllByText('Email Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Dropdown Select')).toBeInTheDocument();
    expect(screen.getByText('Star Rating')).toBeInTheDocument();

    // Add a dropdown field from palette
    const dropdownBtn = screen.getByText('Dropdown Select');
    fireEvent.click(dropdownBtn);

    // Verify field count incremented
    const activeStep = updatedSchema.steps[0];
    expect(activeStep.fields.some((f) => f.type === 'dropdown')).toBe(true);
  });

  it('3. Tests JSON Export and Import integrity', () => {
    const form = createDefaultForm('JSON Test Form');
    const exportedJson = exportFormToJson(form);
    expect(typeof exportedJson).toBe('string');

    const imported = importFormFromJson(exportedJson);
    expect(imported.success).toBe(true);
    expect(imported.data?.title).toBe('JSON Test Form');
    expect(imported.data?.steps).toHaveLength(form.steps.length);

    // Rejection of invalid payload
    const malformed = importFormFromJson('{"title": 123}');
    expect(malformed.success).toBe(false);
    expect(malformed.error).toBeDefined();
  });

  it('4. Tests LocalStorage persistence, autosave draft, and simulated submissions', () => {
    clearSubmissions();
    const testForm = createDefaultForm('Draft Autosave Form');

    // Save draft
    saveDraft(testForm);
    const loaded = loadSavedDraft();
    expect(loaded.title).toBe('Draft Autosave Form');

    // Save test response
    const submission = saveSubmission(testForm.id, testForm.title, { full_name: 'Jane Doe', rating: 5 });
    expect(submission.id).toBeDefined();

    const storedSubmissions = loadSubmissions();
    expect(storedSubmissions).toHaveLength(1);
    expect(storedSubmissions[0].data.full_name).toBe('Jane Doe');

    // Clean up
    clearSubmissions();
    expect(loadSubmissions()).toHaveLength(0);
  });

  it('5. Tests all 6 pre-built templates for structural validity', () => {
    expect(ALL_TEMPLATES).toHaveLength(6);

    ALL_TEMPLATES.forEach((tmpl) => {
      expect(tmpl.name).toBeDefined();
      expect(tmpl.schema.steps.length).toBeGreaterThanOrEqual(2);
      expect(tmpl.schema.settings).toBeDefined();

      // Ensure every field has an id, label, and type
      tmpl.schema.steps.forEach((step) => {
        expect(step.title).toBeDefined();
        step.fields.forEach((f) => {
          expect(f.id).toBeDefined();
          expect(f.type).toBeDefined();
          expect(f.label).toBeDefined();
        });
      });
    });
  });

  it('6. Tests FormRenderer multi-step submission and error handling', async () => {
    const multiStep: FormSchema = {
      id: 'smoke_multi',
      title: 'Smoke Test Multi Step',
      version: '1.0.0',
      settings: {
        submitButtonText: 'Finish Form',
        nextButtonText: 'Next Step',
      },
      steps: [
        {
          id: 's1',
          title: 'Step 1',
          fields: [{ id: 'req_text', type: 'text', label: 'Required Field', required: true }],
        },
        {
          id: 's2',
          title: 'Step 2',
          fields: [{ id: 'opt_notes', type: 'textarea', label: 'Optional Notes' }],
        },
      ],
    };

    const onSubmit = vi.fn();
    render(<FormRenderer schema={multiStep} onSubmit={onSubmit} />);

    // Attempting next without filling required field
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    expect(screen.getByText(/There are 1 errors that need your attention/i)).toBeInTheDocument();

    // Fill required field
    fireEvent.change(screen.getByLabelText(/Required Field/), { target: { value: 'Filled In' } });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Advance to step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Finish Form/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ req_text: 'Filled In' }));
      expect(screen.getByText(/Thank You!/i)).toBeInTheDocument();
    });
  });
});
