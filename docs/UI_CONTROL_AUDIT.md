# OpenForm Steps 2.0 — Complete UI & Control Audit

This audit document catalogs every interactive element, navigation link, form action, menu, toggle, template button, and modal control across the OpenForm Steps platform.

---

## 1. Audit Matrix

| Page / Component | Control | Type | Intended Action | Current Behavior | Status | Automated Test Coverage |
|---|---|---|---|---|---|---|
| **Top Navbar** | Logo / App Name | Button | Navigate to Form Builder | Sets `activeTab` to `'builder'` | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | "Builder" Tab | Button | Open visual form editor | Sets `activeTab` to `'builder'`, highlights tab | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | "Templates" Tab | Button | Open template gallery | Sets `activeTab` to `'templates'`, highlights tab | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | "Responses" Tab | Button | Open response inspector | Sets `activeTab` to `'responses'`, shows response count badge | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | "Docs" Tab | Button | Open documentation | Sets `activeTab` to `'docs'`, highlights tab | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | "Examples" Tab | Button | Open interactive code examples | Sets `activeTab` to `'examples'`, highlights tab | Functional | `tests/e2e-smoke.test.tsx` |
| **Top Navbar** | Theme Toggle | Button | Toggle Light/Dark mode | Toggles `dark` class on `document.documentElement` & persists to `localStorage` | Functional | Verified via storage & DOM |
| **Top Navbar** | GitHub Link | Anchor | Open official GitHub repository | Opens `https://github.com/JohnSteeven/openform-steps` in new tab | Functional | Link target verified |
| **Mobile Nav** | Tab Buttons (5) | Buttons | Mobile navigation switching | Updates active view state | Functional | Responsive DOM |
| **Builder Header** | Form Title Input | Text Input | Edit form title inline | Updates schema title & triggers debounced autosave | Functional | `tests/e2e-smoke.test.tsx` |
| **Builder Header** | Undo Button | Button | Revert last schema modification | Reverts state stack via `useHistory` (`Ctrl+Z`) | Functional | `tests/builder/history.test.ts` |
| **Builder Header** | Redo Button | Button | Restore reverted modification | Advances state stack via `useHistory` (`Ctrl+Y`) | Functional | `tests/builder/history.test.ts` |
| **Builder Header** | Settings Button | Button | Open Form Settings modal | Opens `FormSettingsModal` | Functional | Modal interaction test |
| **Builder Header** | JSON Schema Button | Button | Open Import/Export modal | Opens `ImportExportModal` | Functional | `tests/core/export-import.test.ts` |
| **Builder Header** | Live Preview Button | Button | Open interactive Form Preview | Opens `PreviewModal` with multi-step renderer | Functional | `tests/e2e-smoke.test.tsx` |
| **Step Bar** | Step Tabs | Tab Buttons | Switch active editing step | Sets `activeStepIndex` and updates canvas | Functional | `tests/builder/history.test.ts` |
| **Step Bar** | Delete Step Button | Button | Delete step (if > 1 step) | Uses native `confirm()` — **Target for custom accessible dialog** | Needs Upgrade | `tests/builder/history.test.ts` |
| **Step Bar** | "New Step" Button | Button | Append new step to form | Creates default step, pushes to schema, focuses new step | Functional | `tests/e2e-smoke.test.tsx` |
| **Step Canvas** | "Step Settings" | Button | Edit step title, desc, condition | Opens `StepSettingsModal` | Functional | Modal interaction test |
| **Step Canvas** | "Add First Field" | Button | Quick-add text field to empty step | Inserts default text field | Functional | `tests/e2e-smoke.test.tsx` |
| **Field Palette** | 12 Field Type Buttons | Buttons | Add chosen field to current step | Inserts configured field schema at step end | Functional | `tests/e2e-smoke.test.tsx` |
| **Canvas Item** | Drag Handle | Div (draggable) | Reorder field via drag & drop | Reorders fields in state on drop | Functional | Drag event handlers |
| **Canvas Item** | Move Up Button | Button | Accessible reordering (move up) | Swaps field with previous field | Functional | Keyboard accessible test |
| **Canvas Item** | Move Down Button | Button | Accessible reordering (move down)| Swaps field with next field | Functional | Keyboard accessible test |
| **Canvas Item** | Edit Button | Button | Edit field properties | Opens `FieldPropertiesModal` | Functional | Modal property test |
| **Canvas Item** | Duplicate Button | Button | Duplicate field with unique ID | Creates clone with new ID and `(Copy)` suffix | Functional | `tests/e2e-smoke.test.tsx` |
| **Canvas Item** | Delete Button | Button | Remove field from step | Deletes field from current step schema | Functional | Canvas test |
| **Field Modal** | Inputs & Toggles | Form controls | Customize validation, label, options | Updates field schema in draft | Functional | Validation engine test |
| **Field Modal** | Visibility Condition | Rules Builder | Add conditional logic rules | Configures AST condition evaluated by pure engine | Functional | `tests/core/evaluator.test.ts` |
| **Field Modal** | Cancel / Save | Buttons | Discard or commit field changes | Closes modal and updates builder schema | Functional | Component test |
| **Templates** | Category Filter Pills | Buttons | Filter templates by industry | Filters displayed blueprints | Functional | `tests/e2e-smoke.test.tsx` |
| **Templates** | Search Input | Text Input | Filter templates by query text | Missing in v1 — **Target for Phase 2** | Needs Implementation | Added in Phase 2 |
| **Templates** | "Preview" Button | Button | Preview template before use | Opens `PreviewModal` with selected blueprint | Functional | `tests/e2e-smoke.test.tsx` |
| **Templates** | "Use Template" Button| Button | Load blueprint into builder | Uses native `confirm()` — **Target for custom accessible dialog** | Needs Upgrade | `tests/e2e-smoke.test.tsx` |
| **Preview Modal** | Viewport Switcher (3)| Buttons | Preview Desktop / Tablet / Mobile | Resizes preview container frame (100% / 768px / 375px) | Functional | Component test |
| **Preview Modal** | Close Button | Button | Close preview modal | Closes overlay, returns to builder | Functional | Component test |
| **Form Renderer** | Step Inputs | Input elements | Enter test responses | Updates form state, re-evaluates conditions live | Functional | `tests/react/FormRenderer.test.tsx` |
| **Form Renderer** | "Next Step" Button | Button | Validate & advance step | Validates fields via Zod, focuses error summary if invalid | Functional | `tests/react/FormRenderer.test.tsx` |
| **Form Renderer** | "Previous" Button | Button | Go to previous step | Reverts to preceding step preserving values | Functional | `tests/core/state-machine.test.ts` |
| **Form Renderer** | "Submit" Button | Button | Commit final submission | Validates step, invokes `onSubmit`, shows thank you | Functional | `tests/react/FormRenderer.test.tsx` |
| **Responses** | "Export CSV" | Button | Chunked browser CSV download | Time-sliced CSV export with formula injection escaping | Functional | `tests/core/export-import.test.ts` |
| **Responses** | "Export JSON" | Button | Download JSON response file | Serializes submissions array to formatted JSON | Functional | `tests/core/export-import.test.ts` |
| **Responses** | "Clear All Data" | Button | Erase local submissions | Uses native `confirm()` — **Target for custom accessible dialog** | Needs Upgrade | `tests/e2e-smoke.test.tsx` |
| **Responses** | Search Input | Text Input | Search test submissions | Filters submission cards by ID, title, or answers | Functional | `tests/e2e-smoke.test.tsx` |
| **Docs Page** | Code Copy Buttons | Buttons | Copy code snippets | Copies to clipboard and shows "Copied!" checkmark | Functional | Clipboard test |
| **Examples Page** | Example Tabs (3) | Tab Buttons | Switch interactive examples | Toggles Controlled, Custom Field, and Branching demos | Functional | Component test |

---

## 2. Identified Deficiencies & Required Upgrades

1. **Native Browser `confirm()` & `alert()` Dialogs**:
   - Deleting a step, loading a template, and clearing response data currently rely on `window.confirm()`.
   - Native dialogs are inaccessible to screen readers, break keyboard focus management, cannot be styled, and look unprofessional.
   - **Remedy**: Implement a reusable, fully accessible `ConfirmationDialog` component with keyboard focus trap, `aria-modal="true"`, `Escape` handling, safe cancellation, and custom destructive button styling.

2. **Template Gallery Search & Empty States**:
   - The Template Gallery has category pills, but lacks a search input for instant fuzzy searching across template names, descriptions, and field types.
   - It also needs a clear empty state with a "Reset Filters" action when no templates match.

3. **Toast Notifications & Feedback**:
   - Actions like autosave, duplicating a field, copying JSON, loading a template, and clearing responses should provide smooth, accessible toast feedback notifications.

4. **Multi-Form Management**:
   - Users currently edit only one active form draft in localStorage. A complete SaaS platform requires creating multiple forms, renaming, duplicating, switching between forms, and deleting forms.

5. **Cloud Hosted Mode & Publishing (Phase 4 & 5)**:
   - Provide a distinct Mode A (Free Local Mode) and Mode B (Hosted Cloud Service) with accounts, published form URLs (`/f/:id`), public submission endpoints, response limits, expiry dates, and real backend persistence.

6. **Claims Grounding (Phase 8)**:
   - Replace absolute marketing claims ("100% Client-Side Privacy", "WCAG 2.2 AA Compliant") with accurate, verified wording: "Client-First Local Privacy (Default)" and "Designed for WCAG 2.2 AA Targets".
