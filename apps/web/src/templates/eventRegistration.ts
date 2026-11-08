import { FormSchema } from '@openform-steps/core';

export const eventRegistrationTemplate: FormSchema = {
  id: 'template_event_registration',
  title: 'Tech Summit 2026 Registration',
  description: 'Register for the global developer conference in San Francisco and online.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Confirm Registration',
    nextButtonText: 'Next Step',
    backButtonText: 'Back',
    confirmationTitle: 'See You at Tech Summit 2026!',
    confirmationMessage: 'Your registration is confirmed. An event pass barcode and schedule have been prepared.',
    showProgressBar: true,
    progressType: 'bar',
    primaryColor: '#7c3aed',
  },
  steps: [
    {
      id: 'step_attendee',
      title: 'Attendee Details',
      description: 'Your registration badge information.',
      fields: [
        {
          id: 'attendee_name',
          type: 'text',
          label: 'Attendee Full Name',
          placeholder: 'Jordan Lee',
          required: true,
        },
        {
          id: 'attendee_email',
          type: 'email',
          label: 'Email Address for Event Badge',
          placeholder: 'jordan@company.com',
          required: true,
        },
        {
          id: 'attendance_mode',
          type: 'radio',
          label: 'How will you participate?',
          options: [
            { label: 'In-Person (San Francisco Convention Center)', value: 'in_person' },
            { label: 'Virtual Live Stream (Global)', value: 'virtual' },
          ],
          defaultValue: 'in_person',
        },
      ],
    },
    {
      id: 'step_in_person_logistics',
      title: 'In-Person Logistics',
      description: 'Catering and badge customization for on-site attendees.',
      condition: {
        action: 'show',
        condition: {
          rules: [{ fieldId: 'attendance_mode', operator: 'equals', value: 'in_person' }],
        },
      },
      fields: [
        {
          id: 'dietary_needs',
          type: 'dropdown',
          label: 'Dietary Preference',
          options: [
            { label: 'Standard Catering', value: 'standard' },
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'Vegan', value: 'vegan' },
            { label: 'Gluten-Free', value: 'gluten_free' },
            { label: 'Halal / Kosher', value: 'halal_kosher' },
          ],
        },
        {
          id: 'tshirt_size',
          type: 'dropdown',
          label: 'Complimentary T-Shirt Size',
          options: [
            { label: 'Small (S)', value: 's' },
            { label: 'Medium (M)', value: 'm' },
            { label: 'Large (L)', value: 'l' },
            { label: 'Extra Large (XL)', value: 'xl' },
          ],
        },
      ],
    },
    {
      id: 'step_workshops_confirm',
      title: 'Workshops & Confirmation',
      description: 'Select your preferred breakout sessions.',
      fields: [
        {
          id: 'selected_workshops',
          type: 'checkbox',
          label: 'Hands-on Workshops',
          options: [
            { label: 'Building High-Performance React 19 Architectures', value: 'react19' },
            { label: 'Accessible UI & WCAG 2.2 Deep Dive', value: 'a11y' },
            { label: 'Edge Caching & Global Multi-Region CDNs', value: 'edge' },
          ],
        },
        {
          id: 'code_of_conduct_consent',
          type: 'consent',
          label: 'Event Code of Conduct',
          helperText: 'I agree to abide by the Conference Code of Conduct and community guidelines.',
          required: true,
          defaultValue: false,
        },
      ],
    },
  ],
};

