# Changelog

All notable changes to **OpenForm Steps** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-08

### Added
- **Monorepo Architecture**:
  - `@openform-steps/core`: TypeScript schema types, Zod validators, AST condition evaluator, multi-step state machine, and chunked CSV/JSON processors.
  - `@openform-steps/react`: Accessible multi-step React form renderer, theme tokens, error summary alerts, and custom field registry.
  - `@openform-steps/builder`: Visual no-code drag-and-drop form builder with step management, undo/redo history, and property inspector.
  - `@openform-steps/web`: Production showcase website, template gallery, response inspector, interactive documentation, and developer playground.
- **12 Supported Field Types**:
  - Text, Email, Number, Phone, Date, Textarea, Dropdown Select, Radio choices, Checkboxes, Rating review, Consent & Terms, and Content/Heading layouts.
- **Conditional Branching**:
  - Dynamic field visibility with multi-operator rules (`equals`, `not_equals`, `contains`, `is_empty`, etc.).
  - Dynamic step routing (`skip` or `show` steps based on prior responses).
- **Accessibility & Compliance**:
  - WCAG 2.2 AA compliant focus management, aria-describedby associations, touch targets $\ge 44 \times 44\text{ px}$.
  - Accessible error summary alert autofocus on submit.
  - Accessible keyboard reordering alternatives (Move Up / Move Down) in the visual builder.
- **Hyperscale & Edge Ready**:
  - Zero-latency client-side processing.
  - Chunked time-sliced CSV export keeping INP $< 200\text{ ms}$.
  - Route-based code splitting and manual vendor chunks.
- **Pre-Built Template Gallery**:
  - Customer Satisfaction (CSAT), Job Application, Event Registration, Patient Medical Intake, B2B Lead Gen, and IT Support Ticket.
- **Open Source Infrastructure**:
  - MIT License, CONTRIBUTING guide, CODE_OF_CONDUCT, SECURITY policy, CI workflows, and starter issues.

