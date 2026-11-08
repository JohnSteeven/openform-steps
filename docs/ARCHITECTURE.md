# Architecture Documentation

## Overview

OpenForm Steps is architected as an accessible, high-performance, open-source multi-step form builder and React component library. It solves the friction of building, rendering, and customizing multi-step forms while guaranteeing WCAG 2.2 AA compliance and zero backend lock-in.

---

## Monorepo Layout

OpenForm Steps uses a clean pnpm workspace monorepo:

```
openform-steps/
├── packages/
│   ├── core/       # @openform-steps/core: Schemas, Zod validation, conditions, state machine
│   ├── react/      # @openform-steps/react: Accessible React FormRenderer, theme, fields
│   └── builder/    # @openform-steps/builder: Embeddable React FormBuilder component
├── apps/
│   └── web/        # @openform-steps/web: Production showcase app, templates, docs, preview
├── tests/          # Cross-package Vitest unit, integration, and accessibility tests
└── docs/           # Architecture, API references, and scalability blueprints
```

---

## 1. Schema Engine (`@openform-steps/core`)

The core package contains no browser or DOM dependencies, allowing it to execute safely in Node.js, Cloudflare Workers, Edge Runtimes, and browsers.

### Safe AST Condition Evaluation

Unlike legacy form engines that use unsafe `eval()` or `Function()` constructors to evaluate dynamic expressions, OpenForm Steps implements a pure Abstract Syntax Tree (AST) condition evaluator:

```typescript
export interface FieldConditionRule {
  fieldId: string;
  operator: ConditionOperator;
  value?: any;
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';
```

Supported evaluation features:
- Array contains (for multi-select checkboxes)
- Numeric and ISO Date comparison
- Compound logic (`and` / `or`)
- Safe type coercion without script execution

---

## 2. Multi-Step State Machine

Form progression is determined dynamically at runtime:
1. When user requests the next step, `validateStep()` runs against all visible fields in the current step.
2. If invalid, the `ErrorSummary` alert receives focus with links to the invalid inputs.
3. If valid, `getNextStepIndex()` inspects succeeding steps:
   - Evaluates step skip conditions.
   - Bypasses any steps whose conditions resolve to `skip`.
   - Returns the index of the next active step or `null` if on the final step.

---

## 3. Accessible Component Library (`@openform-steps/react`)

Designed to satisfy **WCAG 2.2 AA standards**:
- Form landmarks with semantic HTML (`<form>`, `<fieldset>`, `<legend>`, `<label>`).
- Live progress indicator with `role="progressbar"`, `aria-valuenow`, and descriptive labels.
- Focus management: Moves focus to the step header on step change, and to the error summary on failed validation.
- Touch targets $\ge 44 \times 44\text{ px}$.
- Complete keyboard accessibility (Tab, Enter, Space, Arrow keys).

---

## 4. Visual Form Builder (`@openform-steps/builder`)

Provides an embeddable React form authoring workspace:
- Step tabs with drag and drop or keyboard reordering.
- Field canvas with Move Up / Move Down buttons alongside drag handles.
- Property modals for validation rules, option lists, and visibility conditions.
- Undo / Redo history state stack (`useHistory`).
- Debounced auto-save with status reporting.

