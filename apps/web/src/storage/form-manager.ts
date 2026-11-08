import { FormSchema, createDefaultForm } from '@openform-steps/core';
import { loadSavedDraft, loadSubmissions } from './storage';

export type FormStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface FormRecord {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: FormStatus;
  schema: FormSchema;
  stepsCount: number;
  fieldsCount: number;
  submissionsCount: number;
}

const STORAGE_KEYS = {
  FORMS_LIST: 'openform_forms_manifest_v2',
  ACTIVE_ID: 'openform_active_form_id_v2',
  FORM_PREFIX: 'openform_form_doc_',
};

// Safe JSON parse helper
function safeParse<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

// Compute counts helper
function getFieldCount(schema: FormSchema): number {
  return schema.steps.reduce((acc, step) => acc + step.fields.length, 0);
}

// Get count of responses for a form
function getResponseCount(formId: string): number {
  try {
    const all = loadSubmissions();
    return all.filter((s) => s.formId === formId).length;
  } catch {
    return 0;
  }
}

// Initialize and migrate backward-compatible forms
export function initializeFormStorage(): void {
  const existingList = localStorage.getItem(STORAGE_KEYS.FORMS_LIST);
  if (!existingList) {
    // Check if v1 draft exists
    const legacyDraft = loadSavedDraft();
    const initialRecord: FormRecord = {
      id: legacyDraft.id || `form_${Date.now()}`,
      title: legacyDraft.title || 'Untitled Form',
      description: legacyDraft.description,
      createdAt: legacyDraft.createdAt || new Date().toISOString(),
      updatedAt: legacyDraft.updatedAt || new Date().toISOString(),
      status: 'draft',
      schema: legacyDraft,
      stepsCount: legacyDraft.steps.length,
      fieldsCount: getFieldCount(legacyDraft),
      submissionsCount: getResponseCount(legacyDraft.id),
    };

    localStorage.setItem(STORAGE_KEYS.FORMS_LIST, JSON.stringify([initialRecord]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, initialRecord.id);
    localStorage.setItem(STORAGE_KEYS.FORM_PREFIX + initialRecord.id, JSON.stringify(initialRecord));
  }
}

// Get all stored form summaries
export function getAllForms(): FormRecord[] {
  initializeFormStorage();
  const forms = safeParse<FormRecord[]>(localStorage.getItem(STORAGE_KEYS.FORMS_LIST), []);
  // Refresh live submission counts
  return forms.map((f) => ({
    ...f,
    submissionsCount: getResponseCount(f.id),
  }));
}

// Get active form ID
export function getActiveFormId(): string {
  initializeFormStorage();
  const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
  if (id) return id;

  const forms = getAllForms();
  if (forms.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, forms[0].id);
    return forms[0].id;
  }

  const newDefault = createDefaultForm('My Multi-Step Form');
  saveForm(newDefault);
  return newDefault.id;
}

// Set active form ID
export function setActiveFormId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
}

// Get currently active form schema
export function getActiveFormSchema(): FormSchema {
  initializeFormStorage();
  const activeId = getActiveFormId();
  const storedDoc = localStorage.getItem(STORAGE_KEYS.FORM_PREFIX + activeId);
  if (storedDoc) {
    const record = safeParse<FormRecord | null>(storedDoc, null);
    if (record?.schema) return record.schema;
  }

  // Fallback to list search
  const forms = getAllForms();
  const match = forms.find((f) => f.id === activeId);
  if (match?.schema) return match.schema;

  if (forms.length > 0) {
    setActiveFormId(forms[0].id);
    return forms[0].schema;
  }

  const fresh = createDefaultForm('My Multi-Step Form');
  saveForm(fresh);
  return fresh;
}

// Save or update a form schema
export function saveForm(schema: FormSchema): void {
  initializeFormStorage();
  const now = new Date().toISOString();
  schema.updatedAt = now;

  const activeId = schema.id;
  const forms = getAllForms();
  const existingIdx = forms.findIndex((f) => f.id === activeId);

  const updatedRecord: FormRecord = {
    id: schema.id,
    title: schema.title,
    description: schema.description,
    createdAt: schema.createdAt || (existingIdx >= 0 ? forms[existingIdx].createdAt : now),
    updatedAt: now,
    status: existingIdx >= 0 ? forms[existingIdx].status : 'draft',
    schema,
    stepsCount: schema.steps.length,
    fieldsCount: getFieldCount(schema),
    submissionsCount: getResponseCount(schema.id),
  };

  if (existingIdx >= 0) {
    forms[existingIdx] = updatedRecord;
  } else {
    forms.unshift(updatedRecord);
  }

  localStorage.setItem(STORAGE_KEYS.FORMS_LIST, JSON.stringify(forms));
  localStorage.setItem(STORAGE_KEYS.FORM_PREFIX + activeId, JSON.stringify(updatedRecord));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeId);
}

// Create a new empty form
export function createNewForm(title = 'Untitled Form'): FormSchema {
  initializeFormStorage();
  const newSchema = createDefaultForm(title);
  newSchema.id = `form_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  saveForm(newSchema);
  setActiveFormId(newSchema.id);
  return newSchema;
}

// Duplicate an existing form
export function duplicateForm(formId: string): FormSchema {
  initializeFormStorage();
  const forms = getAllForms();
  const source = forms.find((f) => f.id === formId);
  if (!source) {
    return createNewForm('Duplicated Form');
  }

  const duplicatedSchema: FormSchema = JSON.parse(JSON.stringify(source.schema));
  duplicatedSchema.id = `form_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  duplicatedSchema.title = `${source.title} (Copy)`;
  duplicatedSchema.createdAt = new Date().toISOString();
  duplicatedSchema.updatedAt = new Date().toISOString();

  saveForm(duplicatedSchema);
  setActiveFormId(duplicatedSchema.id);
  return duplicatedSchema;
}

// Delete a form
export function deleteForm(formId: string): FormSchema {
  initializeFormStorage();
  let forms = getAllForms().filter((f) => f.id !== formId);
  localStorage.removeItem(STORAGE_KEYS.FORM_PREFIX + formId);

  if (forms.length === 0) {
    const fresh = createDefaultForm('My Multi-Step Form');
    saveForm(fresh);
    return fresh;
  }

  localStorage.setItem(STORAGE_KEYS.FORMS_LIST, JSON.stringify(forms));
  const nextActive = forms[0];
  setActiveFormId(nextActive.id);
  return nextActive.schema;
}

// Update form lifecycle status (draft | published | closed | archived)
export function updateFormStatus(formId: string, status: FormStatus): void {
  initializeFormStorage();
  const forms = getAllForms();
  const idx = forms.findIndex((f) => f.id === formId);
  if (idx >= 0) {
    forms[idx].status = status;
    forms[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.FORMS_LIST, JSON.stringify(forms));

    const storedDoc = localStorage.getItem(STORAGE_KEYS.FORM_PREFIX + formId);
    if (storedDoc) {
      const record = safeParse<FormRecord | null>(storedDoc, null);
      if (record) {
        record.status = status;
        record.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.FORM_PREFIX + formId, JSON.stringify(record));
      }
    }
  }
}
