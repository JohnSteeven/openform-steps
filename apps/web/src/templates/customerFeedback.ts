import { FormSchema } from '@openform-steps/core';

export const customerFeedbackTemplate: FormSchema = {
  id: 'template_customer_feedback',
  title: 'Customer Satisfaction Survey (CSAT)',
  description: 'Help us improve our service by providing your valued feedback.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Send Feedback',
    nextButtonText: 'Next Question',
    backButtonText: 'Previous',
    confirmationTitle: 'Thank You for Your Feedback!',
    confirmationMessage: 'Your insights help our product and support teams continuously improve.',
    showProgressBar: true,
    progressType: 'steps',
    primaryColor: '#2563eb',
    themeMode: 'auto',
  },
  steps: [
    {
      id: 'step_overall',
      title: 'Overall Experience',
      description: 'How would you rate your recent experience with our platform?',
      fields: [
        {
          id: 'rating_overall',
          type: 'rating',
          label: 'Overall Satisfaction Rating',
          ratingMax: 5,
          ratingIcon: 'star',
          required: true,
          helperText: '1 star = Very Poor, 5 stars = Outstanding',
        },
        {
          id: 'nps_score',
          type: 'dropdown',
          label: 'How likely are you to recommend us to a colleague?',
          required: true,
          options: [
            { label: '10 - Extremely Likely (Promoter)', value: '10' },
            { label: '9 - Very Likely (Promoter)', value: '9' },
            { label: '8 - Likely (Passive)', value: '8' },
            { label: '7 - Neutral (Passive)', value: '7' },
            { label: '6 or lower - Unlikely (Detractor)', value: 'detractor' },
          ],
        },
      ],
    },
    {
      id: 'step_details',
      title: 'Detailed Feedback',
      description: 'Tell us what worked well and what can be enhanced.',
      fields: [
        {
          id: 'satisfaction_drivers',
          type: 'checkbox',
          label: 'Which areas did you interact with today?',
          options: [
            { label: 'User Interface & Navigation', value: 'ui' },
            { label: 'Speed & Performance', value: 'speed' },
            { label: 'Customer Support Response', value: 'support' },
            { label: 'Documentation & Guides', value: 'docs' },
            { label: 'Pricing & Value', value: 'pricing' },
          ],
        },
        {
          id: 'improvement_text',
          type: 'textarea',
          label: 'What could we do better?',
          placeholder: 'Share any specific ideas, bugs, or feature suggestions...',
          validation: { maxLength: 800 },
        },
      ],
    },
    {
      id: 'step_contact',
      title: 'Follow-up Details',
      description: 'Would you be open to an optional follow-up conversation?',
      fields: [
        {
          id: 'allow_followup',
          type: 'radio',
          label: 'May our product team contact you regarding your feedback?',
          options: [
            { label: 'Yes, feel free to reach out', value: 'yes' },
            { label: 'No, please keep my feedback anonymous', value: 'no' },
          ],
          defaultValue: 'yes',
        },
        {
          id: 'contact_email',
          type: 'email',
          label: 'Your Email Address',
          placeholder: 'name@company.com',
          required: true,
          visibilityCondition: {
            rules: [{ fieldId: 'allow_followup', operator: 'equals', value: 'yes' }],
          },
        },
        {
          id: 'consent_terms',
          type: 'consent',
          label: 'Privacy Policy Agreement',
          helperText: 'I agree to the privacy policy regarding the processing of this feedback.',
          required: true,
          defaultValue: false,
        },
      ],
    },
  ],
};

