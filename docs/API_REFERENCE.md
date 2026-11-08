# Public API & REST Reference

## 1. `@openform-steps/react`

### `<FormRenderer />`

The primary component for rendering accessible multi-step forms.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `schema` | `FormSchema` | *Required* | Complete form schema definition. |
| `initialValues` | `Record<string, any>` | `{}` | Initial state for form fields. |
| `onSubmit` | `(data: Record<string, any>) => void \| Promise<void>` | `undefined` | Callback invoked upon final step completion. |
| `onChange` | `(values: Record<string, any>) => void` | `undefined` | Real-time state update callback. |
| `onStepChange` | `(stepIndex: number) => void` | `undefined` | Callback fired when the active step changes. |
| `onError` | `(errors: Record<string, string>) => void` | `undefined` | Callback fired when validation fails. |
| `customFields` | `Record<string, React.ComponentType<CustomFieldProps>>` | `undefined` | Map of custom field components. |
| `theme` | `Partial<FormTheme>` | `defaultTheme` | Theme token overrides. |
| `className` | `string` | `""` | Optional CSS class for the form container. |
| `disabled` | `boolean` | `false` | When true, disables all inputs and buttons. |

---

### `<ConfirmationDialog />`

An accessible replacement for native `window.confirm()` and `window.alert()`.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | *Required* | Whether the dialog is visible. |
| `title` | `string` | *Required* | Accessible modal heading. |
| `description` | `string` | *Required* | Detailed explanatory text. |
| `confirmLabel` | `string` | `'Confirm'` | Label for primary confirmation button. |
| `cancelLabel` | `string` | `'Cancel'` | Label for cancellation button. |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Visual accent styling. |
| `onConfirm` | `() => void` | *Required* | Callback invoked on confirm. |
| `onCancel` | `() => void` | *Required* | Callback invoked on cancel or `Escape`. |

---

## 2. `@openform-steps/builder`

### `<FormBuilder />`

The embeddable visual multi-step form editor component.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialSchema` | `FormSchema` | *Required* | Initial form schema to load into the builder. |
| `onChange` | `(schema: FormSchema) => void` | `undefined` | Callback fired whenever form structure or rules change. |
| `onPreviewToggle` | `() => void` | `undefined` | Optional callback when preview button is clicked. |
| `className` | `string` | `""` | Optional CSS class. |

---

## 3. `@openform-steps/core`

### Helper Functions

- `createDefaultForm(title?: string): FormSchema` — Generates a new multi-step form with default structure.
- `createDefaultStep(stepNumber?: number): StepSchema` — Generates a new step.
- `createDefaultField(type: FieldType): FieldSchema` — Generates a field definition with sensible defaults.
- `evaluateCondition(condition?: FieldCondition, values?: Record<string, any>): boolean` — Evaluates conditional rules.
- `validateStep(step: StepSchema, values: Record<string, any>): ValidationResult` — Validates all visible fields in a step.
- `getNextStepIndex(schema: FormSchema, currentIndex: number, values: Record<string, any>): number | null` — Returns the next valid active step index.
- `exportFormToJson(schema: FormSchema, pretty?: boolean): string` — Serializes form schema to JSON.
- `importFormFromJson(jsonString: string): ImportResult` — Validates and imports a JSON schema string using Zod.
- `exportResponsesToCsv(schema: FormSchema, submissions: FormSubmission[]): string` — Exports submission records to sanitized CSV.
- `chunkedCsvExport(schema: FormSchema, submissions: FormSubmission[], onProgress?: (p: number) => void): Promise<string>` — Asynchronous time-sliced CSV export for large datasets.

---

## 4. `@openform-steps/api` REST Endpoints

### Authentication
- `POST /api/auth/register` — Create new user account (`email`, `password`, `name`).
- `POST /api/auth/login` — Sign in and receive bearer token.
- `GET /api/auth/me` — Inspect profile of current authenticated user.
- `POST /api/auth/logout` — Terminate session.

### Form Management (Bearer Token Required)
- `GET /api/forms` — List cloud forms owned by authenticated user.
- `POST /api/forms` — Create a new cloud form.
- `GET /api/forms/:id` — Retrieve cloud form by ID (isolated to owner).
- `PUT /api/forms/:id` — Update form title, schema, or quota settings.
- `PATCH /api/forms/:id/status` — Set status: `draft` | `published` | `closed` | `archived`.
- `POST /api/forms/:id/duplicate` — Duplicate cloud form.
- `DELETE /api/forms/:id` — Delete cloud form and cascade-delete submissions.
- `GET /api/forms/:id/submissions` — Retrieve paginated submissions for form.
- `GET /api/forms/:id/submissions/export/csv` — Stream formula-safe CSV export.
- `GET /api/forms/:id/stats` — Retrieve submission count and last response timestamp.

### Public Forms (Visitor Accessible)
- `GET /api/public/forms/:id` — Fetch published form schema definition. Returns `404` if not found, `403` if draft or closed, and `410` if expired or quota reached.
- `POST /api/public/forms/:id/submit` — Submit answers to published form. Validates input schema, increments count, and enforces quota limits.
