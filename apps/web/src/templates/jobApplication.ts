import { FormSchema } from '@openform-steps/core';

export const jobApplicationTemplate: FormSchema = {
  id: 'template_job_application',
  title: 'Engineering Job Application',
  description: 'Join our team. Complete this multi-step application to get started.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Submit Application',
    nextButtonText: 'Proceed to Next Step',
    backButtonText: 'Back',
    confirmationTitle: 'Application Submitted!',
    confirmationMessage: 'We have received your application. Our recruiting team will review your profile within 3 business days.',
    showProgressBar: true,
    progressType: 'steps',
    primaryColor: '#059669',
  },
  steps: [
    {
      id: 'step_applicant_info',
      title: 'Applicant Info',
      description: 'Your contact and basic personal details.',
      fields: [
        {
          id: 'applicant_name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Alex Morgan',
          required: true,
        },
        {
          id: 'applicant_email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'alex@example.com',
          required: true,
        },
        {
          id: 'applicant_phone',
          type: 'phone',
          label: 'Phone Number',
          placeholder: '+1 (555) 234-5678',
          required: true,
        },
      ],
    },
    {
      id: 'step_role_selection',
      title: 'Role & Experience',
      description: 'Tell us about the role and your background.',
      fields: [
        {
          id: 'target_role',
          type: 'dropdown',
          label: 'Role you are applying for',
          required: true,
          options: [
            { label: 'Senior Frontend Engineer (React/TypeScript)', value: 'frontend' },
            { label: 'Staff Backend Architect (Go/Node)', value: 'backend' },
            { label: 'Full Stack Engineer', value: 'fullstack' },
            { label: 'Accessibility & Design Systems Specialist', value: 'a11y' },
          ],
        },
        {
          id: 'years_experience',
          type: 'number',
          label: 'Years of Professional Experience',
          required: true,
          validation: { min: 0, max: 50 },
        },
        {
          id: 'tech_skills',
          type: 'checkbox',
          label: 'Primary Core Skills',
          options: [
            { label: 'React / Next.js', value: 'react' },
            { label: 'TypeScript / Node', value: 'typescript' },
            { label: 'Tailwind CSS / UI Systems', value: 'tailwind' },
            { label: 'WCAG 2.2 Accessibility Audits', value: 'wcag' },
            { label: 'Vitest / Playwright / E2E Testing', value: 'testing' },
          ],
        },
      ],
    },
    {
      id: 'step_links_consent',
      title: 'Portfolio & Legal',
      description: 'Online links and consent acknowledgment.',
      fields: [
        {
          id: 'portfolio_url',
          type: 'text',
          label: 'GitHub or Portfolio URL',
          placeholder: 'https://github.com/username',
          required: true,
        },
        {
          id: 'cover_summary',
          type: 'textarea',
          label: 'Why are you excited to join us?',
          placeholder: 'Brief summary of your motivations and accomplishments...',
          validation: { maxLength: 600 },
        },
        {
          id: 'data_consent',
          type: 'consent',
          label: 'Applicant Data Consent',
          helperText: 'I consent to the collection and processing of my application data for recruitment purposes.',
          required: true,
          defaultValue: false,
        },
      ],
    },
  ],
};
