import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormRenderer } from '../../packages/react/src/components/FormRenderer';
import { FormSchema } from '../../packages/core/src/schema/types';

describe('FormRenderer Component', () => {
  const testSchema: FormSchema = {
    id: 'test-form',
    title: 'Customer Onboarding',
    version: '1.0.0',
    settings: {
      submitButtonText: 'Submit My Response',
      nextButtonText: 'Next',
      backButtonText: 'Previous',
      showProgressBar: true,
    },
    steps: [
      {
        id: 'step_1',
        title: 'Personal Info',
        fields: [
          { id: 'user_name', type: 'text', label: 'Your Name', required: true },
          { id: 'user_email', type: 'email', label: 'Email', required: true },
        ],
      },
      {
        id: 'step_2',
        title: 'Feedback',
        fields: [
          { id: 'rating', type: 'rating', label: 'Experience Rating', ratingMax: 5, required: true },
        ],
      },
    ],
  };

  it('renders the first step title and inputs', () => {
    render(<FormRenderer schema={testSchema} />);
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it('blocks advancing when required fields are empty and shows accessible error summary', async () => {
    render(<FormRenderer schema={testSchema} />);

    const nextBtn = screen.getByRole('button', { name: /Continue to next step/i });
    fireEvent.click(nextBtn);

    // Should stay on step 1 and display errors
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText(/There are 2 errors that need your attention/i)).toBeInTheDocument();
  });

  it('advances to step 2 when step 1 inputs are valid', async () => {
    render(<FormRenderer schema={testSchema} />);

    const nameInput = screen.getByLabelText(/Your Name/);
    const emailInput = screen.getByLabelText(/Email/);

    fireEvent.change(nameInput, { target: { value: 'Alex Morgan' } });
    fireEvent.change(emailInput, { target: { value: 'alex@example.com' } });

    const nextBtn = screen.getByRole('button', { name: /Continue to next step/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('Feedback')).toBeInTheDocument();
      expect(screen.getByText(/Experience Rating/)).toBeInTheDocument();
    });
  });

  it('completes multi-step flow and triggers onSubmit callback', async () => {
    const handleSubmit = vi.fn();
    render(<FormRenderer schema={testSchema} onSubmit={handleSubmit} />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'alex@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to next step/i }));

    // Step 2
    await waitFor(() => {
      expect(screen.getByText('Feedback')).toBeInTheDocument();
    });

    const starBtn = screen.getByRole('radio', { name: /5 out of 5/i });
    fireEvent.click(starBtn);

    const submitBtn = screen.getByRole('button', { name: /Submit My Response/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          user_name: 'Alex Morgan',
          user_email: 'alex@example.com',
          rating: 5,
        })
      );
      expect(screen.getByText(/Thank You!/i)).toBeInTheDocument();
    });
  });
});

