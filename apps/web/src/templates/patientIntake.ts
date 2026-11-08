import { FormSchema } from '@openform-steps/core';

export const patientIntakeTemplate: FormSchema = {
  id: 'template_patient_intake',
  title: 'Healthcare Patient Pre-Visit Intake',
  description: 'Complete your medical registration prior to your clinical appointment.',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Complete Intake',
    nextButtonText: 'Next Section',
    backButtonText: 'Previous',
    confirmationTitle: 'Intake Completed Successfully',
    confirmationMessage: 'Your clinic check-in is complete. Please arrive 10 minutes prior to your scheduled slot.',
    showProgressBar: true,
    progressType: 'steps',
    primaryColor: '#0284c7',
  },
  steps: [
    {
      id: 'step_patient_details',
      title: 'Patient Details',
      description: 'Primary patient demographic information.',
      fields: [
        {
          id: 'patient_full_name',
          type: 'text',
          label: 'Patient Legal Name',
          required: true,
        },
        {
          id: 'date_of_birth',
          type: 'date',
          label: 'Date of Birth',
          required: true,
        },
        {
          id: 'emergency_contact_phone',
          type: 'phone',
          label: 'Emergency Contact Phone Number',
          required: true,
        },
      ],
    },
    {
      id: 'step_clinical_history',
      title: 'Medical History',
      description: 'Pre-existing conditions and known allergies.',
      fields: [
        {
          id: 'has_allergies',
          type: 'radio',
          label: 'Do you have any known medical or drug allergies?',
          required: true,
          options: [
            { label: 'Yes, I have known allergies', value: 'yes' },
            { label: 'No known allergies', value: 'no' },
          ],
          defaultValue: 'no',
        },
        {
          id: 'allergy_description',
          type: 'textarea',
          label: 'Please list all known allergies and reactions',
          required: true,
          placeholder: 'e.g. Penicillin (rash), Latex, Peanuts...',
          visibilityCondition: {
            rules: [{ fieldId: 'has_allergies', operator: 'equals', value: 'yes' }],
          },
        },
        {
          id: 'current_medications',
          type: 'textarea',
          label: 'Current Prescription Medications & Dosages',
          placeholder: 'List medications taken regularly...',
        },
      ],
    },
    {
      id: 'step_consent_hipaa',
      title: 'Consent & Policies',
      description: 'Regulatory medical treatment authorization.',
      fields: [
        {
          id: 'hipaa_consent',
          type: 'consent',
          label: 'Notice of Privacy Practices & HIPAA Acknowledgment',
          helperText: 'I acknowledge receipt and agreement to the privacy practices and electronic records policy.',
          required: true,
          defaultValue: false,
        },
      ],
    },
  ],
};

