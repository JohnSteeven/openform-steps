import { FormSchema } from '@openform-steps/core';

export const itSupportTicketTemplate: FormSchema = {
  id: 'template_it_support',
  title: 'IT Helpdesk Incident Report',
  description: 'Report technical bugs, system outages, or hardware support tickets.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'File Incident Ticket',
    nextButtonText: 'Next Step',
    backButtonText: 'Back',
    confirmationTitle: 'Ticket Logged: #INC-8924',
    confirmationMessage: 'Our on-call reliability engineer has been paged. Track updates in your notifications.',
    showProgressBar: true,
    progressType: 'bar',
    primaryColor: '#dc2626',
  },
  steps: [
    {
      id: 'step_severity',
      title: 'Incident Classification',
      description: 'Define urgency and affected system.',
      fields: [
        {
          id: 'incident_summary',
          type: 'text',
          label: 'Short Problem Summary',
          placeholder: 'e.g. Inability to checkout during step 2',
          required: true,
        },
        {
          id: 'severity_level',
          type: 'dropdown',
          label: 'Incident Severity Level',
          required: true,
          options: [
            { label: 'P1 - Critical Outage (All users blocked)', value: 'p1' },
            { label: 'P2 - Major Degradation (Workaround exists)', value: 'p2' },
            { label: 'P3 - Minor Bug / Cosmetic Issue', value: 'p3' },
            { label: 'P4 - Feature Request / Feedback', value: 'p4' },
          ],
        },
        {
          id: 'affected_os',
          type: 'radio',
          label: 'Client Operating System',
          options: [
            { label: 'Windows', value: 'windows' },
            { label: 'macOS', value: 'macos' },
            { label: 'Linux', value: 'linux' },
            { label: 'Mobile (iOS / Android)', value: 'mobile' },
          ],
        },
      ],
    },
    {
      id: 'step_reproduction',
      title: 'Reproduction Steps',
      description: 'Detailed error messages and reproduction steps.',
      fields: [
        {
          id: 'error_logs',
          type: 'textarea',
          label: 'Reproduction Steps & Error Stack Trace',
          placeholder: 'Paste console logs or steps to reproduce...',
          required: true,
        },
        {
          id: 'urgent_callback',
          type: 'consent',
          label: 'Require Emergency Paging',
          helperText: 'Page on-call staff immediately via SMS/Phone.',
          required: false,
          defaultValue: false,
        },
      ],
    },
  ],
};

