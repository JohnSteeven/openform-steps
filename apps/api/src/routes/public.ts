import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { formsTable, submissionsTable, auditEventsTable } from '../db/schema.js';
import { hashIp } from '../lib/auth.js';
import { eq } from 'drizzle-orm';
import { FormSchema, validateStep } from '@openform-steps/core';

export const publicRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Fetch public form schema for rendering
  fastify.get('/forms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const form = db.select().from(formsTable).where(eq(formsTable.id, id)).get();
    if (!form) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'The requested form does not exist.',
      });
    }

    // Status check
    if (form.status === 'draft') {
      return reply.status(403).send({
        error: 'FormNotPublished',
        message: 'This form is currently an unpublished draft.',
      });
    }
    if (form.status === 'closed' || form.status === 'archived') {
      return reply.status(403).send({
        error: 'FormClosed',
        message: 'This form is closed and no longer accepting submissions.',
      });
    }

    // Expiry check
    if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
      return reply.status(410).send({
        error: 'FormExpired',
        message: 'This form has expired and is no longer accepting submissions.',
      });
    }

    // Max submissions limit check
    if (form.maxSubmissions && form.submissionsCount >= form.maxSubmissions) {
      return reply.status(410).send({
        error: 'SubmissionLimitReached',
        message: 'This form has reached its maximum allowed responses.',
      });
    }

    const schema: FormSchema = JSON.parse(form.schemaJson);

    return reply.send({
      id: form.id,
      title: form.title,
      description: form.description,
      status: form.status,
      schema,
    });
  });

  // 2. Submit public form response
  fastify.post('/forms/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const answers = (request.body || {}) as Record<string, any>;

    const form = db.select().from(formsTable).where(eq(formsTable.id, id)).get();
    if (!form) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'The requested form does not exist.',
      });
    }

    if (form.status !== 'published') {
      return reply.status(403).send({
        error: 'FormNotAcceptingResponses',
        message: `This form is ${form.status} and cannot accept submissions.`,
      });
    }

    if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
      return reply.status(410).send({
        error: 'FormExpired',
        message: 'This form has expired.',
      });
    }

    if (form.maxSubmissions && form.submissionsCount >= form.maxSubmissions) {
      return reply.status(410).send({
        error: 'SubmissionLimitReached',
        message: 'This form has reached its response quota.',
      });
    }

    // Validate answers against the form's schema steps
    const schema: FormSchema = JSON.parse(form.schemaJson);
    const validationErrors: Record<string, string> = {};

    for (const step of schema.steps) {
      const stepValidation = validateStep(step, answers);
      if (!stepValidation.isValid) {
        Object.assign(validationErrors, stepValidation.errors);
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return reply.status(422).send({
        error: 'ValidationError',
        message: 'Please complete all required fields according to validation rules.',
        details: validationErrors,
      });
    }

    const submissionId = `sub_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const now = new Date().toISOString();
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipHash = hashIp(request.ip);

    // Save submission
    db.insert(submissionsTable)
      .values({
        id: submissionId,
        formId: id,
        dataJson: JSON.stringify(answers),
        ipHash,
        userAgent,
        createdAt: now,
      })
      .run();

    // Increment submission count
    const nextCount = form.submissionsCount + 1;
    const shouldClose = form.maxSubmissions ? nextCount >= form.maxSubmissions : false;

    db.update(formsTable)
      .set({
        submissionsCount: nextCount,
        status: shouldClose ? 'closed' : form.status,
        updatedAt: now,
      })
      .where(eq(formsTable.id, id))
      .run();

    // Log audit event
    db.insert(auditEventsTable)
      .values({
        id: `aud_${crypto.randomUUID()}`,
        userId: form.userId,
        formId: id,
        action: 'submit_response',
        ipHash,
        details: `Public submission recorded for form "${form.title}"`,
        createdAt: now,
      })
      .run();

    return reply.status(201).send({
      success: true,
      submissionId,
      message: 'Your response has been recorded successfully.',
      submittedAt: now,
    });
  });
};
