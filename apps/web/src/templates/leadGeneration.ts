import { FormSchema } from '@openform-steps/core';

export const leadGenerationTemplate: FormSchema = {
  id: 'template_b2b_lead_gen',
  title: 'Enterprise Solution Assessment',
  description: 'Evaluate enterprise scale and get a customized architecture quote.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Request Architecture Proposal',
    nextButtonText: 'Continue Assessment',
    backButtonText: 'Back',
    confirmationTitle: 'Proposal Request Received!',
    confirmationMessage: 'Our solutions architect will contact you within 24 hours with an architecture blueprint.',
    showProgressBar: true,
    progressType: 'percentage',
    primaryColor: '#4f46e5',
  },
  steps: [
    {
      id: 'step_company_profile',
      title: 'Company Profile',
      description: 'Your organization details.',
      fields: [
        {
          id: 'company_name',
          type: 'text',
          label: 'Company or Organization Name',
          required: true,
        },
        {
          id: 'work_email',
          type: 'email',
          label: 'Business Email',
          required: true,
          helperText: 'Please use your official work domain.',
        },
        {
          id: 'team_size',
          type: 'dropdown',
          label: 'Engineering Team Size',
          required: true,
          options: [
            { label: '1 - 10 engineers', value: '1-10' },
            { label: '11 - 50 engineers', value: '11-50' },
            { label: '51 - 250 engineers', value: '51-250' },
            { label: '250+ enterprise engineers', value: 'enterprise' },
          ],
        },
      ],
    },
    {
      id: 'step_scale_requirements',
      title: 'Scale & Traffic',
      description: 'Your user scale and latency requirements.',
      fields: [
        {
          id: 'monthly_users',
          type: 'dropdown',
          label: 'Expected Monthly Active Users (MAU)',
          required: true,
          options: [
            { label: 'Under 100,000 MAU', value: 'tier_1' },
            { label: '100,000 to 10 Lakhs MAU', value: 'tier_2' },
            { label: '10 Lakhs to 1 Crore MAU', value: 'tier_3' },
            { label: 'Over 1 Crore MAU (Global Hyperscale)', value: 'tier_4' },
          ],
        },
        {
          id: 'primary_cloud',
          type: 'radio',
          label: 'Primary Cloud Infrastructure',
          options: [
            { label: 'Cloudflare Edge / Fastly CDN', value: 'edge' },
            { label: 'AWS (Amazon Web Services)', value: 'aws' },
            { label: 'Google Cloud Platform (GCP)', value: 'gcp' },
            { label: 'Microsoft Azure', value: 'azure' },
          ],
        },
        {
          id: 'project_notes',
          type: 'textarea',
          label: 'Key Technical Objectives or Pain Points',
          placeholder: 'Tell us about latency goals, WCAG accessibility requirements, compliance...',
        },
      ],
    },
  ],
};
