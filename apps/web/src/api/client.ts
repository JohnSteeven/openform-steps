import { FormSchema } from '@openform-steps/core';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:3001';

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CloudFormSummary {
  id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'published' | 'closed' | 'archived';
  submissionsCount: number;
  maxSubmissions?: number | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSubmissionItem {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
}

// Token storage helpers
const TOKEN_KEY = 'openform_cloud_token_v2';
const USER_KEY = 'openform_cloud_user_v2';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): CloudUser | null {
  const json = localStorage.getItem(USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: CloudUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Authentication
export async function register(email: string, password: string, name: string) {
  const res = await request<{ token: string; user: CloudUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  saveAuthSession(res.token, res.user);
  return res.user;
}

export async function login(email: string, password: string) {
  const res = await request<{ token: string; user: CloudUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveAuthSession(res.token, res.user);
  return res.user;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore error on logout
  }
  clearAuthSession();
}

export async function fetchMe(): Promise<CloudUser | null> {
  if (!getStoredToken()) return null;
  try {
    return await request<CloudUser>('/api/auth/me');
  } catch {
    clearAuthSession();
    return null;
  }
}

// Cloud Forms CRUD
export async function getCloudForms(): Promise<CloudFormSummary[]> {
  const res = await request<{ forms: CloudFormSummary[] }>('/api/forms');
  return res.forms;
}

export async function createCloudForm(title: string, schema?: FormSchema): Promise<{ id: string; schema: FormSchema }> {
  return request<{ id: string; schema: FormSchema }>('/api/forms', {
    method: 'POST',
    body: JSON.stringify({ title, schema }),
  });
}

export async function getCloudForm(id: string): Promise<{ id: string; title: string; status: CloudFormSummary['status']; schema: FormSchema; maxSubmissions?: number; expiresAt?: string }> {
  return request(`/api/forms/${id}`);
}

export async function updateCloudForm(
  id: string,
  payload: { title?: string; schema?: FormSchema; maxSubmissions?: number | null; expiresAt?: string | null }
) {
  return request(`/api/forms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function setCloudFormStatus(id: string, status: CloudFormSummary['status']) {
  return request<{ id: string; status: CloudFormSummary['status'] }>(`/api/forms/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function duplicateCloudForm(id: string) {
  return request<CloudFormSummary>(`/api/forms/${id}/duplicate`, {
    method: 'POST',
  });
}

export async function deleteCloudForm(id: string) {
  return request<{ success: boolean; message: string }>(`/api/forms/${id}`, {
    method: 'DELETE',
  });
}

export async function getCloudSubmissions(id: string): Promise<{ total: number; submissions: CloudSubmissionItem[] }> {
  return request(`/api/forms/${id}/submissions`);
}

export function getCloudCsvExportUrl(id: string): string {
  const token = getStoredToken();
  return `${API_BASE}/api/forms/${id}/submissions/export/csv?token=${token || ''}`;
}

// Public Form API
export async function getPublicForm(id: string): Promise<{ id: string; title: string; description?: string; status: string; schema: FormSchema }> {
  return request(`/api/public/forms/${id}`);
}

export async function submitPublicForm(id: string, data: Record<string, any>): Promise<{ success: boolean; submissionId: string; message: string }> {
  return request(`/api/public/forms/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
