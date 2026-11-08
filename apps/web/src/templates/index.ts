import { FormSchema } from '@openform-steps/core';
import { customerFeedbackTemplate } from './customerFeedback';
import { jobApplicationTemplate } from './jobApplication';
import { eventRegistrationTemplate } from './eventRegistration';
import { patientIntakeTemplate } from './patientIntake';
import { leadGenerationTemplate } from './leadGeneration';
import { itSupportTicketTemplate } from './itSupportTicket';

export interface TemplateMetadata {
  id: string;
  name: string;
  category: 'Feedback' | 'HR & Recruiting' | 'Events' | 'Healthcare' | 'Sales & B2B' | 'IT Support';
  description: string;
  stepsCount: number;
  fieldsCount: number;
  schema: FormSchema;
}

export const ALL_TEMPLATES: TemplateMetadata[] = [
  {
    id: customerFeedbackTemplate.id,
    name: 'Customer Satisfaction (CSAT)',
    category: 'Feedback',
    description: 'NPS rating, multiple satisfaction driver checkboxes, conditional follow-up email, and privacy consent.',
    stepsCount: customerFeedbackTemplate.steps.length,
    fieldsCount: customerFeedbackTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: customerFeedbackTemplate,
  },
  {
    id: jobApplicationTemplate.id,
    name: 'Engineering Job Application',
    category: 'HR & Recruiting',
    description: 'Applicant contacts, role select, years experience validation, skill checkboxes, and GitHub portfolio.',
    stepsCount: jobApplicationTemplate.steps.length,
    fieldsCount: jobApplicationTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: jobApplicationTemplate,
  },
  {
    id: eventRegistrationTemplate.id,
    name: 'Tech Summit 2026 Registration',
    category: 'Events',
    description: 'Multi-track conference registration with conditional in-person catering step and workshop selections.',
    stepsCount: eventRegistrationTemplate.steps.length,
    fieldsCount: eventRegistrationTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: eventRegistrationTemplate,
  },
  {
    id: patientIntakeTemplate.id,
    name: 'Healthcare Patient Medical Intake',
    category: 'Healthcare',
    description: 'Pre-visit demographics, conditional allergy descriptions, medications, and HIPAA acknowledgment.',
    stepsCount: patientIntakeTemplate.steps.length,
    fieldsCount: patientIntakeTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: patientIntakeTemplate,
  },
  {
    id: leadGenerationTemplate.id,
    name: 'Enterprise Scale Assessment',
    category: 'Sales & B2B',
    description: 'Company size, high-scale traffic bands (lakhs to crores MAU), cloud choice, and architecture consultation.',
    stepsCount: leadGenerationTemplate.steps.length,
    fieldsCount: leadGenerationTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: leadGenerationTemplate,
  },
  {
    id: itSupportTicketTemplate.id,
    name: 'IT Helpdesk Incident Ticket',
    category: 'IT Support',
    description: 'Priority P1-P4 triage, OS picker, stack trace textarea, and emergency on-call paging trigger.',
    stepsCount: itSupportTicketTemplate.steps.length,
    fieldsCount: itSupportTicketTemplate.steps.reduce((acc, s) => acc + s.fields.length, 0),
    schema: itSupportTicketTemplate,
  },
];

