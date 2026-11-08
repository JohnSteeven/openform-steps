# Public API Reference

## `@openform-steps/react`

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

## `@openform-steps/builder`

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

## `@openform-steps/core`

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
