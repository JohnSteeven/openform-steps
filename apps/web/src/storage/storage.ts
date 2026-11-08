import { FormSchema, FormSubmission, createDefaultForm } from '@openform-steps/core';

const DRAFT_STORAGE_KEY = 'openform_steps_active_draft';
const RESPONSES_STORAGE_KEY = 'openform_steps_submissions';
const THEME_STORAGE_KEY = 'openform_steps_theme';

export function loadSavedDraft(): FormSchema {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.steps && parsed.steps.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load draft from localStorage:', err);
  }
  return createDefaultForm('Customer Feedback Survey');
}

export function saveDraft(schema: FormSchema): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(schema));
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
  }
}

export function loadSubmissions(): FormSubmission[] {
  try {
    const raw = localStorage.getItem(RESPONSES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load submissions:', err);
  }
  return [];
}

export function saveSubmission(formId: string, formTitle: string, data: Record<string, any>): FormSubmission {
  const submission: FormSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    formId,
    formTitle,
    submittedAt: new Date().toISOString(),
    data,
  };

  try {
    const existing = loadSubmissions();
    const updated = [submission, ...existing];
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save submission to localStorage:', err);
  }

  return submission;
}

export function clearSubmissions(): void {
  try {
    localStorage.removeItem(RESPONSES_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear submissions:', err);
  }
}

export function getThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

