import { FieldSchema, FieldType, FormSchema, FormSettings, StepSchema } from './types';
import { CURRENT_SCHEMA_VERSION } from './version';

export function createDefaultSettings(): FormSettings {
  return {
    submitButtonText: 'Submit Form',
    nextButtonText: 'Continue',
    backButtonText: 'Back',
    confirmationTitle: 'Thank You!',
    confirmationMessage: 'Your submission has been received successfully.',
    showProgressBar: true,
    progressType: 'bar',
    themeMode: 'auto',
    primaryColor: '#2563eb',
    clearHiddenValues: false,
    allowStepJump: false,
  };
}

export function createDefaultField(type: FieldType, id?: string): FieldSchema {
  const generatedId = id || `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (type) {
    case 'text':
      return {
        id: generatedId,
        type: 'text',
        label: 'Full Name',
        placeholder: 'e.g. Jane Doe',
        required: true,
      };
    case 'email':
      return {
        id: generatedId,
        type: 'email',
        label: 'Email Address',
        placeholder: 'jane@example.com',
        required: true,
      };
    case 'number':
      return {
        id: generatedId,
        type: 'number',
        label: 'Age or Quantity',
        placeholder: '0',
        validation: { min: 0, max: 120 },
      };
    case 'phone':
      return {
        id: generatedId,
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
      };
    case 'date':
      return {
        id: generatedId,
        type: 'date',
        label: 'Date',
        required: false,
      };
    case 'textarea':
      return {
        id: generatedId,
        type: 'textarea',
        label: 'Additional Comments',
        placeholder: 'Tell us more...',
        validation: { maxLength: 500 },
      };
    case 'dropdown':
      return {
        id: generatedId,
        type: 'dropdown',
        label: 'Select an Option',
        options: [
          { label: 'Option A', value: 'option_a' },
          { label: 'Option B', value: 'option_b' },
          { label: 'Option C', value: 'option_c' },
        ],
        required: false,
      };
    case 'radio':
      return {
        id: generatedId,
        type: 'radio',
        label: 'Choose One',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        required: false,
      };
    case 'checkbox':
      return {
        id: generatedId,
        type: 'checkbox',
        label: 'Select all that apply',
        options: [
          { label: 'Feature Alpha', value: 'alpha' },
          { label: 'Feature Beta', value: 'beta' },
          { label: 'Feature Gamma', value: 'gamma' },
        ],
        defaultValue: [],
      };
    case 'rating':
      return {
        id: generatedId,
        type: 'rating',
        label: 'How would you rate your experience?',
        ratingMax: 5,
        ratingIcon: 'star',
        required: false,
      };
    case 'consent':
      return {
        id: generatedId,
        type: 'consent',
        label: 'Terms and Privacy Agreement',
        helperText: 'I agree to the terms of service and privacy policy.',
        required: true,
        defaultValue: false,
      };
    case 'content':
      return {
        id: generatedId,
        type: 'content',
        label: 'Section Heading',
        contentHeading: 'Welcome to this Section',
        contentText: 'Please review the information below before proceeding to the next questions.',
      };
    default:
      return {
        id: generatedId,
        type: 'text',
        label: 'New Field',
      };
  }
}

export function createDefaultStep(stepNumber = 1, id?: string): StepSchema {
  const generatedId = id || `step_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: generatedId,
    title: `Step ${stepNumber}: Details`,
    description: 'Please fill in the information below.',
    fields: [createDefaultField('text')],
  };
}

export function createDefaultForm(title = 'Untitled Form'): FormSchema {
  const now = new Date().toISOString();
  return {
    id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    description: 'A multi-step form built with OpenForm Steps.',
    version: CURRENT_SCHEMA_VERSION,
    steps: [
      {
        id: 'step_1',
        title: 'Personal Info',
        description: 'Tell us a bit about yourself.',
        fields: [
          createDefaultField('text', 'full_name'),
          createDefaultField('email', 'email_address'),
        ],
      },
      {
        id: 'step_2',
        title: 'Feedback',
        description: 'Share your thoughts with our team.',
        fields: [
          createDefaultField('rating', 'overall_rating'),
          createDefaultField('textarea', 'feedback_comments'),
        ],
      },
    ],
    settings: createDefaultSettings(),
    createdAt: now,
    updatedAt: now,
  };
}
