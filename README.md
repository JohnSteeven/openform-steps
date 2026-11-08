# OpenForm Steps

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React 19.3](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev)
[![Vite 8.3](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev)
[![Tailwind CSS 4.3](https://img.shields.io/badge/Tailwind-4.3-38bdf8.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success.svg)](./docs/ARCHITECTURE.md)

**OpenForm Steps** is an accessible, production-grade open-source multi-step form builder and React component library. It enables developers and teams to create, customize, and deploy multi-step wizard forms with conditional branching, validation, and zero server lock-in.

Official Repository: [https://github.com/JohnSteeven/openform-steps](https://github.com/JohnSteeven/openform-steps)

---

## Highlights

- **Visual No-Code Form Builder**: Create, edit, duplicate, and reorder steps and fields with drag-and-drop or accessible keyboard controls.
- **Accessible React Form Renderer (`<FormRenderer />`)**: WCAG 2.2 AA compliant, automated error summary autofocus, screen-reader friendly ARIA landmarks, and high-contrast touch targets $\ge 44 \times 44\text{ px}$.
- **12 Supported Field Types**: Text, Email, Number, Telephone, Date, Textarea, Dropdown Select, Radio Choices, Multi-Select Checkboxes, Star Rating, Consent & Terms, and Section Content/Headings.
- **Dynamic Conditional Branching**: Show or hide fields dynamically, or skip/route entire form steps based on prior answers.
- **100% Client-Side Privacy**: Runs completely in the browser sandbox. Drafts and simulated responses save locally by default without tracking or third-party cookies.
- **Edge-Ready Static Architecture**: Pre-compiled static frontend designed for global CDN caching, minimizing origin server overhead and enabling fast initial page delivery.
- **Time-Sliced Chunked Export**: Export thousands of submissions to sanitized CSV without freezing the UI thread (INP $< 200\text{ ms}$).
- **Pre-Built Template Gallery**: Customer Satisfaction (CSAT), Job Application, Event Registration, Patient Medical Intake, B2B Lead Gen, and IT Support Ticket.
- **Undo / Redo History**: Full state history stack in the builder with `Ctrl+Z` and `Ctrl+Y` keyboard shortcuts.

---

## Monorepo Packages

| Package | Version | Description |
|---|---|---|
| [`@openform-steps/core`](./packages/core) | `1.0.0` | Schemas, Zod validation, safe AST evaluator, and multi-step state machine. |
| [`@openform-steps/react`](./packages/react) | `1.0.0` | Accessible React form rendering components, theme system, and custom field registry. |
| [`@openform-steps/builder`](./packages/builder) | `1.0.0` | Embeddable React form builder component with palette, canvas, and property inspector. |
| [`@openform-steps/web`](./apps/web) | `1.0.0` | Full demonstration web app, interactive playground, and documentation site. |

---

## Quick Start

### 1. Installation

```bash
# Using pnpm
pnpm add @openform-steps/core @openform-steps/react

# Using npm
npm install @openform-steps/core @openform-steps/react
```

### 2. Render a Multi-Step Form

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
    console.log('Submission data:', data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FormRenderer schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}
```

---

## Development & Testing Commands

To run and test the project locally:

```bash
# Install dependencies across all packages
pnpm install

# Run the demonstration web app locally
pnpm dev

# Run Vitest automated test suite
pnpm test

# Run tests with code coverage report
pnpm test:coverage

# Run TypeScript typechecks across all packages
pnpm typecheck

# Build all packages and web app for production
pnpm build
```

---

## Accessibility (WCAG 2.2 AA)

OpenForm Steps is built around accessibility:
- **Keyboard Traversal**: Every input, button, tab, and dialog is accessible via keyboard alone.
- **Accessible Error Summary**: If validation fails on submit, keyboard focus automatically jumps to the top `<ErrorSummary />` with direct links to the invalid inputs.
- **Screen Reader Announcements**: Live region progress bar (`role="progressbar"`), clear error associations (`aria-describedby`), and `aria-required` tags.
- **Touch Target Size**: All click targets are sized $\ge 44 \times 44\text{ px}$.

---

## Contributing & Community

We welcome contributions to OpenForm Steps! Please read our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

Check out our curated [Starter Issues](./docs/STARTER_ISSUES.md) if you are looking for a great first contribution.

---

## License

Released under the [MIT License](./LICENSE).

