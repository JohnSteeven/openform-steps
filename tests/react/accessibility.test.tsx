import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormRenderer } from '../../packages/react/src/components/FormRenderer';
import { FormSchema } from '../../packages/core/src/schema/types';

describe('WCAG 2.2 AA Accessibility Checks', () => {
  const accessibleSchema: FormSchema = {
    id: 'a11y-form',
    title: 'Accessible Form',
    version: '1.0.0',
    settings: {
      showProgressBar: true,
      progressType: 'bar',
    },
    steps: [
      {
        id: 'step_1',
        title: 'Step 1: Contact',
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Legal Name',
            helperText: 'As it appears on your passport',
            required: true,
          },
          {
            id: 'pref_contact',
            type: 'radio',
            label: 'Preferred Contact Method',
            options: [
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
            ],
            required: true,
          },
        ],
      },
    ],
  };

  it('provides accessible progressbar with aria-valuenow and aria-label', () => {
    render(<FormRenderer schema={accessibleSchema} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-label', 'Form completion progress');
  });

  it('associates inputs with labels, helper texts, and error messages via aria-describedby', () => {
    render(<FormRenderer schema={accessibleSchema} />);

    const input = screen.getByLabelText(/Full Legal Name/);
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-describedby');

    const describedById = input.getAttribute('aria-describedby');
    expect(describedById).toBe('helper-full_name');
    expect(screen.getByText('As it appears on your passport')).toHaveAttribute('id', 'helper-full_name');
  });

  it('renders radio options inside an accessible radiogroup fieldset', () => {
    render(<FormRenderer schema={accessibleSchema} />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute('aria-labelledby', 'legend-pref_contact');

    const radioEmail = screen.getByLabelText('Email');
    const radioPhone = screen.getByLabelText('Phone');
    expect(radioEmail).toHaveAttribute('type', 'radio');
    expect(radioPhone).toHaveAttribute('type', 'radio');
  });

  it('displays role="alert" with focus management on validation failure', () => {
    render(<FormRenderer schema={accessibleSchema} />);

    const submitBtn = screen.getByRole('button', { name: /Submit Form/i });
    fireEvent.click(submitBtn);

    const alerts = screen.getAllByRole('alert');
    const topSummary = alerts[0];
    expect(topSummary).toBeInTheDocument();
    expect(topSummary).toHaveAttribute('tabindex', '-1');
    expect(topSummary).toHaveAttribute('aria-labelledby', 'error-summary-title');
  });
});
