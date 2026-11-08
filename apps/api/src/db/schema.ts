import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Users table
export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Forms table
export const formsTable = sqliteTable(
  'forms',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('draft'), // 'draft' | 'published' | 'closed' | 'archived'
    schemaJson: text('schema_json').notNull(), // JSON FormSchema
    maxSubmissions: integer('max_submissions'), // optional response limit
    expiresAt: text('expires_at'), // optional ISO timestamp
    submissionsCount: integer('submissions_count').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_forms_user_id').on(table.userId),
    statusIdx: index('idx_forms_status').on(table.status),
  })
);

// Form Submissions table
export const submissionsTable = sqliteTable(
  'submissions',
  {
    id: text('id').primaryKey(),
    formId: text('form_id')
      .notNull()
      .references(() => formsTable.id, { onDelete: 'cascade' }),
    dataJson: text('data_json').notNull(), // JSON record of field answers
    ipHash: text('ip_hash').notNull(), // anonymized hash for rate limiting
    userAgent: text('user_agent'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    formIdDateIdx: index('idx_submissions_form_date').on(table.formId, table.createdAt),
  })
);

// Audit events table
export const auditEventsTable = sqliteTable(
  'audit_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    formId: text('form_id'),
    action: text('action').notNull(), // 'create_form', 'publish_form', 'close_form', 'submit_response', 'export_data'
    ipHash: text('ip_hash'),
    details: text('details'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    userActionIdx: index('idx_audit_user_action').on(table.userId, table.action),
  })
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Form = typeof formsTable.$inferSelect;
export type NewForm = typeof formsTable.$inferInsert;
export type Submission = typeof submissionsTable.$inferSelect;
export type NewSubmission = typeof submissionsTable.$inferInsert;
