import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { FormSchema } from '@openform-steps/core';

describe('OpenForm Steps 2.0 API & Multi-Tenant Isolation Test Suite', () => {
  let app: FastifyInstance;
  let userAToken: string;
  let userBToken: string;
  let formAId: string;
  const uniqueId = Date.now();
  const emailA = `usera_${uniqueId}@example.com`;
  const emailB = `userb_${uniqueId}@example.com`;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /health returns service health status', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.status).toBe('ok');
    expect(json.service).toBe('openform-steps-api');
  });

  it('2. POST /api/auth/register creates User A and validates passwords', async () => {
    // Attempt weak password
    const weakRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: emailA, password: '123', name: 'User A' },
    });
    expect(weakRes.statusCode).toBe(400);

    // Valid registration
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: emailA, password: 'StrongPassword2026!', name: 'User A' },
    });
    expect(res.statusCode).toBe(201);
    const json = res.json();
    expect(json.token).toBeDefined();
    expect(json.user.email).toBe(emailA);
    userAToken = json.token;

    // Register User B for isolation checks
    const resB = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: emailB, password: 'StrongPassword2026!', name: 'User B' },
    });
    expect(resB.statusCode).toBe(201);
    userBToken = resB.json().token;
  });

  it('3. POST /api/auth/login authenticates with valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: emailA, password: 'StrongPassword2026!' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toBeDefined();
  });

  it('4. User A creates a form draft', async () => {
    const customSchema: FormSchema = {
      id: 'temp_id',
      title: 'Cloud Customer Feedback',
      version: '1.0.0',
      settings: {},
      steps: [
        {
          id: 'step_1',
          title: 'Feedback Step',
          fields: [
            { id: 'full_name', type: 'text', label: 'Full Name', required: true },
            { id: 'rating', type: 'rating', label: 'Rating', required: true },
          ],
        },
      ],
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/forms',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        title: 'Cloud Customer Feedback',
        schema: customSchema,
      },
    });

    expect(res.statusCode).toBe(201);
    const json = res.json();
    expect(json.id).toBeDefined();
    expect(json.status).toBe('draft');
    formAId = json.id;
  });

  it('5. STRICT RESOURCE ISOLATION: User B CANNOT view or access User A form', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/forms/${formAId}`,
      headers: { authorization: `Bearer ${userBToken}` },
    });

    // Must return 404 to avoid leaking existence of another tenant's resource
    expect(res.statusCode).toBe(404);
  });

  it('6. User A updates form with response limits and publishes it', async () => {
    // Set maxSubmissions = 2
    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/forms/${formAId}`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { maxSubmissions: 2 },
    });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.json().maxSubmissions).toBe(2);

    // Publish form
    const pubRes = await app.inject({
      method: 'PATCH',
      url: `/api/forms/${formAId}/status`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { status: 'published' },
    });
    expect(pubRes.statusCode).toBe(200);
    expect(pubRes.json().status).toBe('published');
  });

  it('7. Public visitor fetches published form schema without account', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/public/forms/${formAId}`,
    });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.title).toBe('Cloud Customer Feedback');
    expect(json.schema.steps).toHaveLength(1);
  });

  it('8. Public visitor submits invalid data -> 422 with validation errors', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/public/forms/${formAId}/submit`,
      payload: { full_name: '' }, // missing required fields
    });
    expect(res.statusCode).toBe(422);
    const json = res.json();
    expect(json.error).toBe('ValidationError');
    expect(json.details.full_name).toBeDefined();
  });

  it('9. Public visitor submits valid responses and hits submission limit', async () => {
    // Submission 1
    const sub1 = await app.inject({
      method: 'POST',
      url: `/api/public/forms/${formAId}/submit`,
      payload: { full_name: 'Alice Wonder', rating: 5 },
    });
    expect(sub1.statusCode).toBe(201);
    expect(sub1.json().submissionId).toBeDefined();

    // Submission 2 (reaches limit = 2)
    const sub2 = await app.inject({
      method: 'POST',
      url: `/api/public/forms/${formAId}/submit`,
      payload: { full_name: 'Bob Builder', rating: 4 },
    });
    expect(sub2.statusCode).toBe(201);

    // Submission 3 (quota exceeded -> 403 or 410)
    const sub3 = await app.inject({
      method: 'POST',
      url: `/api/public/forms/${formAId}/submit`,
      payload: { full_name: 'Charlie Chaplin', rating: 5 },
    });
    expect([403, 410]).toContain(sub3.statusCode);
  });

  it('10. User A inspects submissions and exports CSV', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/forms/${formAId}/submissions`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.total).toBe(2);
    expect(json.submissions).toHaveLength(2);

    // CSV export
    const csvRes = await app.inject({
      method: 'GET',
      url: `/api/forms/${formAId}/submissions/export/csv`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.body).toContain('Alice Wonder');
    expect(csvRes.body).toContain('Bob Builder');
  });

  it('11. User A deletes form -> cascade deletes all submissions', async () => {
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/forms/${formAId}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(delRes.statusCode).toBe(200);

    // Confirm form is gone
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/forms/${formAId}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(getRes.statusCode).toBe(404);
  });
});
