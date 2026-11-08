# OpenForm Steps 2.0 — Production Database Assessment & PostgreSQL Migration Plan

## 1. Production Suitability Assessment: SQLite (WAL Mode)

OpenForm Steps 2.0 currently utilizes **SQLite** via `better-sqlite3` managed with **Drizzle ORM** and configured with Write-Ahead Logging (`PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;`).

### 1.1 Where SQLite Is Suitable for Production
- **Single-Node VPS / Edge Deployments**: When deployed as a single Docker container or service on a Linux VPS (Hetzner, DigitalOcean, Linode, AWS EC2) or on PaaS with persistent disk attachments (Fly.io, Railway with volume).
- **Embedded & On-Premises Appliances**: Zero-configuration, zero-ops, local-first environments where administrators should not have to maintain an external database cluster.
- **Read-Heavy & Modest-Write Workloads**: In WAL mode, concurrent reads never block writes and concurrent writes never block reads. SQLite can handle up to **1,000–2,000 writes per second** and tens of thousands of sub-millisecond reads per second.

### 1.2 Where SQLite Becomes a Production Blocker
- **Horizontal Scaling (Multi-Instance Replicas)**: When running multiple stateless container replicas (e.g. Kubernetes pods, AWS ECS tasks, Google Cloud Run autoscaling from 1 to 50 instances), SQLite cannot be shared across multiple compute nodes over network filesystems (NFS, SMB) without risk of corruption or heavy lock contention.
- **Serverless Environments**: Ephemeral serverless containers lack persistent local disks between invocations.
- **High-Concurrency Distributed Submissions**: When thousands of simultaneous incoming submissions hit multiple geographically dispersed backend instances.

---

## 2. Production PostgreSQL Architecture

For multi-instance horizontal scaling, **PostgreSQL 16+** is the recommended enterprise production database engine.

```
                  +--------------------------------+
                  |  Cloud CDN / Cloudflare Edge   |
                  +---------------+----------------+
                                  |
                                  v
                  +---------------+----------------+
                  |    Load Balancer (Traefik/ALB) |
                  +---------------+----------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
|  API Replica Pod 1    |                   |  API Replica Pod 2    |
|  (Node.js / Fastify)  |                   |  (Node.js / Fastify)  |
+-----------+-----------+                   +-----------+-----------+
            |                                           |
            +---------------------+---------------------+
                                  |
                                  v
                  +---------------+----------------+
                  |    PgBouncer Connection Pool   |
                  +---------------+----------------+
                                  |
                                  v
                  +---------------+----------------+
                  | Managed PostgreSQL 16 Cluster  |
                  |  (Primary + Read Replicas)     |
                  +--------------------------------+
```

---

## 3. Concrete Drizzle ORM PostgreSQL Code

### 3.1 Dependencies
Install the PostgreSQL driver and Drizzle kit:
```bash
pnpm --filter @openform-steps/api add pg
pnpm --filter @openform-steps/api add -D @types/pg
```

### 3.2 Database Schema (`apps/api/src/db/schema.pg.ts`)
```typescript
import { pgTable, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { FormSchema } from '@openform-steps/core';

export const usersTable = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const formsTable = pgTable('forms', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 32 }).notNull().default('draft'),
  schema: jsonb('schema').$type<FormSchema>().notNull(),
  maxSubmissions: integer('max_submissions'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_forms_user_id').on(table.userId),
  index('idx_forms_status').on(table.status),
]);

export const submissionsTable = pgTable('submissions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  formId: varchar('form_id', { length: 64 })
    .notNull()
    .references(() => formsTable.id, { onDelete: 'cascade' }),
  data: jsonb('data').$type<Record<string, any>>().notNull(),
  ipHash: varchar('ip_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_submissions_form_id').on(table.formId),
  index('idx_submissions_created_at').on(table.createdAt),
]);
```

### 3.3 Database Client Connection (`apps/api/src/db/index.pg.ts`)
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.pg.js';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable must be provided for PostgreSQL mode.');
}

export const pool = new Pool({
  connectionString,
  max: 20, // 20 pooled connections per replica pod
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

export const db = drizzle(pool, { schema });
```

---

## 4. Zero-Downtime Data Migration Script (SQLite to PostgreSQL)

To migrate an existing SQLite database into production PostgreSQL without loss of user accounts, form schemas, or past submissions:

```typescript
import Database from 'better-sqlite3';
import pg from 'pg';

async function migrateData() {
  const sqlite = new Database('.data/openform.db', { readonly: true });
  const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  console.log('[Migration] Beginning SQLite -> PostgreSQL migration...');

  // 1. Users
  const users = sqlite.prepare('SELECT * FROM users').all();
  for (const u of users as any[]) {
    await pgClient.query(
      `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email, u.password_hash, u.name, u.role, u.created_at, u.updated_at]
    );
  }
  console.log(`[Migration] Migrated ${users.length} users.`);

  // 2. Forms
  const forms = sqlite.prepare('SELECT * FROM forms').all();
  for (const f of forms as any[]) {
    await pgClient.query(
      `INSERT INTO forms (id, user_id, title, description, status, schema, max_submissions, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [f.id, f.user_id, f.title, f.description, f.status, f.schema, f.max_submissions, f.expires_at, f.created_at, f.updated_at]
    );
  }
  console.log(`[Migration] Migrated ${forms.length} forms.`);

  // 3. Submissions
  const submissions = sqlite.prepare('SELECT * FROM submissions').all();
  for (const s of submissions as any[]) {
    await pgClient.query(
      `INSERT INTO submissions (id, form_id, data, ip_hash, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [s.id, s.form_id, s.data, s.ip_hash, s.created_at]
    );
  }
  console.log(`[Migration] Migrated ${submissions.length} submissions.`);

  await pgClient.end();
  sqlite.close();
  console.log('[Migration] Migration completed successfully.');
}

migrateData().catch(console.error);
```

---

## 5. Deployment Recommendation Summary

| Deployment Tier | Recommended Database | Concurrency Capacity | Operational Cost |
| :--- | :--- | :--- | :--- |
| **Tier 1: Open-Source Single VPS** | **SQLite (WAL Mode)** | Up to 1,000 req/sec | \$0 / mo (bundled) |
| **Tier 2: Scale-Up Managed Cloud** | **PostgreSQL (Supabase / Neon / RDS)** | 5,000–50,000 req/sec | \$15–\$60 / mo |
| **Tier 3: Global Multi-Region Enterprise** | **PostgreSQL + Read Replicas + PgBouncer** | > 100,000 req/sec | \$150+ / mo |
