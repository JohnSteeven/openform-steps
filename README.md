# OpenForm Steps 2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React 19.3](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev)
[![Vite 8.3](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev)
[![Tailwind CSS 4.3](https://img.shields.io/badge/Tailwind-4.3-38bdf8.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-black.svg)](https://fastify.dev)
[![Target WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-Target%20WCAG%202.2%20AA-success.svg)](./docs/ARCHITECTURE.md)

**OpenForm Steps** is an accessible, production-grade open-source form-building platform and React developer library. It provides a visual no-code form builder, a pure TypeScript schema engine, an accessible React renderer, and a turnkey hosted backend service for cloud storage, public URL sharing, and live submission processing.

Official Repository: [https://github.com/JohnSteeven/openform-steps](https://github.com/JohnSteeven/openform-steps)

---

## Operating Modes

| Feature | Mode A: Free Local-First | Mode B: Hosted Cloud Service |
|---|---|---|
| **Account Requirement** | None (instant zero-friction use) | User Registration & JWT Authentication |
| **Data Storage** | Browser `localStorage` sandbox | SQLite / PostgreSQL via Drizzle ORM |
| **Form Builder** | Full visual drag-and-drop builder | Full visual drag-and-drop builder |
| **Multi-Form Workspaces** | Local form switcher & drafts | Cloud forms dashboard & management |
| **Public URL Sharing** | No (local preview only) | Yes (`/?form=<formId>` public links) |
| **Visitor Submissions** | Local simulated responses | Live anonymous visitor responses |
| **Response Limits & Expiry** | Manual | Automated (`maxSubmissions`, `expiresAt`) |
| **Data Export** | Chunked CSV & JSON export | Chunked CSV & JSON export + API streaming |
| **Embed Codes** | Static React component snippets | Responsive `<iframe>` & React snippets |

---

## Monorepo Packages

| Package | Version | Description |
|---|---|---|
| [`@openform-steps/core`](./packages/core) | `1.0.0` | Schemas, Zod validation, safe AST condition evaluator, and multi-step state machine. |
| [`@openform-steps/react`](./packages/react) | `1.0.0` | Accessible React form rendering components, theme system, and custom accessible dialogs. |
| [`@openform-steps/builder`](./packages/builder) | `1.0.0` | Embeddable React form builder component with palette, canvas, and property inspector. |
| [`@openform-steps/api`](./apps/api) | `1.0.0` | Fastify REST backend with Drizzle ORM, multi-tenant isolation, and public endpoints. |
| [`@openform-steps/web`](./apps/web) | `2.0.0` | Production showcase web application with template gallery, cloud dashboard, and docs. |

---

## Quick Start

### 1. Developer Setup

```bash
# Clone the repository
git clone https://github.com/JohnSteeven/openform-steps.git
cd openform-steps

# Install workspace dependencies with pnpm
pnpm install

# Run type checks across all packages
pnpm typecheck

# Run automated test suite (51 tests)
pnpm test

# Build all packages, API, and web application
pnpm build
```

### 2. Local Development

```bash
# Start frontend web application (runs at http://localhost:5173)
pnpm dev

# In a separate terminal, start backend API (runs at http://localhost:3001)
pnpm --filter @openform-steps/api dev
```

---

## React Library Usage

```tsx
import React from 'react';
import { FormRenderer } from '@openform-steps/react';
import { FormSchema } from '@openform-steps/core';

const schema: FormSchema = {
  id: 'feedback-survey',
  title: 'Customer Feedback Survey',
  version: '1.0.0',
  settings: {
    submitButtonText: 'Submit Feedback',
    showProgressBar: true,
    progressType: 'steps',
    primaryColor: '#2563eb',
  },
  steps: [
    {
      id: 'step_1',
      title: 'Your Contact Details',
      fields: [
        { id: 'full_name', type: 'text', label: 'Full Name', required: true },
        { id: 'email', type: 'email', label: 'Work Email', required: true },
      ],
    },
    {
      id: 'step_2',
      title: 'Satisfaction Rating',
      fields: [
        { id: 'rating', type: 'rating', label: 'How satisfied are you?', ratingMax: 5, required: true },
        { id: 'notes', type: 'textarea', label: 'Additional Comments' },
      ],
    },
  ],
};

export function App() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Submission payload:', data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FormRenderer schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}
```

---

## Accessibility & Security Highlights

- **Targeted for WCAG 2.2 AA**: Tested with automated and keyboard checks. High-contrast touch targets $\ge 44 \times 44\text{ px}$, semantic ARIA landmarks, and focus management.
- **Pure AST Condition Evaluator**: Zero `eval()` or dynamic code execution.
- **Formula Injection Defense**: Automatic prepending of single quotes (`'`) to export fields starting with `=`, `+`, `-`, or `@` to neutralize spreadsheet execution.
- **Multi-Tenant Resource Isolation**: User A can never inspect, modify, or export User B's forms or submissions.
- **Anonymized IP Hashing**: SHA-256 IP hashing protects visitor privacy while preventing submission spam.

---

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Public & REST API Reference](./docs/API_REFERENCE.md)
- [UI Control Audit](./docs/UI_CONTROL_AUDIT.md)
- [Performance & Scalability Blueprint](./docs/PERFORMANCE_AND_SCALABILITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
