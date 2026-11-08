import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { formsTable, submissionsTable, auditEventsTable } from '../db/schema.js';
import { verifyToken, TokenPayload, hashIp } from '../lib/auth.js';
import { eq, and, desc } from 'drizzle-orm';
import { FormSchema, createDefaultForm, chunkedCsvExport } from '@openform-steps/core';

// Helper to authenticate request
function requireAuth(request: FastifyRequest, reply: FastifyReply): TokenPayload | null {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    return null;
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    return null;
  }
  return payload;
}

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').default('Untitled Form'),
  description: z.string().optional(),
  schema: z.any().optional(),
});

const updateFormSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  schema: z.any().optional(),
  maxSubmissions: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'closed', 'archived']),
});

export const formsRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. List user forms
  fastify.get('/', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const forms = db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        submissionsCount: formsTable.submissionsCount,
        maxSubmissions: formsTable.maxSubmissions,
        expiresAt: formsTable.expiresAt,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.userId, auth.userId))
      .orderBy(desc(formsTable.updatedAt))
      .all();

    return reply.send({ forms });
  });

  // 2. Create new form
  fastify.post('/', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const parse = createFormSchema.safeParse(request.body || {});
    if (!parse.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: parse.error.errors[0]?.message || 'Invalid form data',
      });
    }

    const { title, description } = parse.data;
    const formId = `frm_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const now = new Date().toISOString();

    const baseSchema: FormSchema = parse.data.schema || createDefaultForm(title);
    baseSchema.id = formId;
    baseSchema.title = title;
    if (description) baseSchema.description = description;

    db.insert(formsTable)
      .values({
        id: formId,
        userId: auth.userId,
        title,
        description: description || null,
        status: 'draft',
        schemaJson: JSON.stringify(baseSchema),
        submissionsCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(auditEventsTable)
      .values({
        id: `aud_${crypto.randomUUID()}`,
        userId: auth.userId,
        formId,
        action: 'create_form',
        ipHash: hashIp(request.ip),
        details: `Created form "${title}"`,
        createdAt: now,
      })
      .run();

    return reply.status(201).send({
      id: formId,
      title,
      description,
      status: 'draft',
      schema: baseSchema,
      submissionsCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  });

  // 3. Get single form by ID (Strict ownership isolation)
  fastify.get('/:id', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };

    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    return reply.send({
      id: form.id,
      title: form.title,
      description: form.description,
      status: form.status,
      schema: JSON.parse(form.schemaJson),
      maxSubmissions: form.maxSubmissions,
      expiresAt: form.expiresAt,
      submissionsCount: form.submissionsCount,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    });
  });

  // 4. Update form (Strict ownership isolation)
  fastify.put('/:id', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const parse = updateFormSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: parse.error.errors[0]?.message || 'Invalid update data',
      });
    }

    const updates = parse.data;
    const now = new Date().toISOString();

    let newSchemaJson = form.schemaJson;
    if (updates.schema) {
      newSchemaJson = JSON.stringify(updates.schema);
    } else if (updates.title) {
      const parsed = JSON.parse(form.schemaJson);
      parsed.title = updates.title;
      newSchemaJson = JSON.stringify(parsed);
    }

    db.update(formsTable)
      .set({
        title: updates.title || form.title,
        description: updates.description !== undefined ? updates.description : form.description,
        schemaJson: newSchemaJson,
        maxSubmissions: updates.maxSubmissions !== undefined ? updates.maxSubmissions : form.maxSubmissions,
        expiresAt: updates.expiresAt !== undefined ? updates.expiresAt : form.expiresAt,
        updatedAt: now,
      })
      .where(eq(formsTable.id, id))
      .run();

    return reply.send({
      id,
      title: updates.title || form.title,
      description: updates.description !== undefined ? updates.description : form.description,
      status: form.status,
      schema: JSON.parse(newSchemaJson),
      maxSubmissions: updates.maxSubmissions !== undefined ? updates.maxSubmissions : form.maxSubmissions,
      expiresAt: updates.expiresAt !== undefined ? updates.expiresAt : form.expiresAt,
      submissionsCount: form.submissionsCount,
      updatedAt: now,
    });
  });

  // 5. Update form status: draft | published | closed | archived
  fastify.patch('/:id/status', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const parse = updateStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Status must be draft, published, closed, or archived.',
      });
    }

    const { status } = parse.data;
    const now = new Date().toISOString();

    db.update(formsTable)
      .set({ status, updatedAt: now })
      .where(eq(formsTable.id, id))
      .run();

    db.insert(auditEventsTable)
      .values({
        id: `aud_${crypto.randomUUID()}`,
        userId: auth.userId,
        formId: id,
        action: `status_${status}`,
        ipHash: hashIp(request.ip),
        details: `Form status changed to ${status}`,
        createdAt: now,
      })
      .run();

    return reply.send({ id, status, updatedAt: now });
  });

  // 6. Duplicate form
  fastify.post('/:id/duplicate', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const source = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!source) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const newFormId = `frm_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const now = new Date().toISOString();
    const clonedSchema: FormSchema = JSON.parse(source.schemaJson);
    clonedSchema.id = newFormId;
    clonedSchema.title = `${source.title} (Copy)`;

    db.insert(formsTable)
      .values({
        id: newFormId,
        userId: auth.userId,
        title: `${source.title} (Copy)`,
        description: source.description,
        status: 'draft',
        schemaJson: JSON.stringify(clonedSchema),
        submissionsCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return reply.status(201).send({
      id: newFormId,
      title: `${source.title} (Copy)`,
      description: source.description,
      status: 'draft',
      schema: clonedSchema,
      submissionsCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  });

  // 7. Delete form & cascade
  fastify.delete('/:id', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    db.delete(formsTable).where(eq(formsTable.id, id)).run();

    db.insert(auditEventsTable)
      .values({
        id: `aud_${crypto.randomUUID()}`,
        userId: auth.userId,
        formId: id,
        action: 'delete_form',
        ipHash: hashIp(request.ip),
        details: `Deleted form "${form.title}"`,
        createdAt: new Date().toISOString(),
      })
      .run();

    return reply.send({ success: true, message: 'Form and all submissions deleted.' });
  });

  // 8. List submissions for form (Strict owner check, paginated)
  fastify.get('/:id/submissions', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; offset?: string };
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));
    const offset = Math.max(0, parseInt(query.offset || '0', 10));

    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const rows = db
      .select()
      .from(submissionsTable)
      .where(eq(submissionsTable.formId, id))
      .orderBy(desc(submissionsTable.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const submissions = rows.map((r) => ({
      id: r.id,
      formId: r.formId,
      data: JSON.parse(r.dataJson),
      createdAt: r.createdAt,
    }));

    return reply.send({
      formId: id,
      total: form.submissionsCount,
      limit,
      offset,
      submissions,
    });
  });

  // 9. Export submissions as CSV (Formula injection safe)
  fastify.get('/:id/submissions/export/csv', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const rows = db
      .select()
      .from(submissionsTable)
      .where(eq(submissionsTable.formId, id))
      .orderBy(desc(submissionsTable.createdAt))
      .all();

    const formSchema: FormSchema = JSON.parse(form.schemaJson);
    const submissionsFormatted = rows.map((r) => ({
      id: r.id,
      formId: r.formId,
      formTitle: form.title,
      submittedAt: r.createdAt,
      data: JSON.parse(r.dataJson),
    }));

    const csvData = await chunkedCsvExport(formSchema, submissionsFormatted);

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="form-${id}-submissions.csv"`);
    return reply.send(csvData);
  });

  // 10. Form analytics & stats
  fastify.get('/:id/stats', async (request, reply) => {
    const auth = requireAuth(request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const form = db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, auth.userId)))
      .get();

    if (!form) {
      return reply.status(404).send({ error: 'NotFound', message: 'Form not found or access denied.' });
    }

    const latest = db
      .select({ createdAt: submissionsTable.createdAt })
      .from(submissionsTable)
      .where(eq(submissionsTable.formId, id))
      .orderBy(desc(submissionsTable.createdAt))
      .limit(1)
      .get();

    return reply.send({
      formId: id,
      title: form.title,
      status: form.status,
      submissionsCount: form.submissionsCount,
      maxSubmissions: form.maxSubmissions,
      expiresAt: form.expiresAt,
      lastSubmissionAt: latest?.createdAt || null,
    });
  });
};
