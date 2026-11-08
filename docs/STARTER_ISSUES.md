# Genuine Starter Issues for Contributors

These are genuine, vetted issues and planned enhancements designed for open-source contributors looking to make their first contributions to **OpenForm Steps**.

---

### Issue #1: Add Accessible File Upload Field with Client-Side Size and MIME Validation
- **Difficulty**: Intermediate
- **Package**: `@openform-steps/core`, `@openform-steps/react`, `@openform-steps/builder`
- **Goal**: Implement a `file` field type that allows users to select documents or images with client-side restrictions (`maxSizeInBytes`, `acceptedMimeTypes`), displaying accessible file name badges and progress indicators.
- **Accessibility Requirement**: Must support drag-and-drop as well as standard file dialog activation via keyboard (`Space` / `Enter`).

---

### Issue #2: Multi-Language Localization (i18n) for Built-in Strings
- **Difficulty**: Beginner / Intermediate
- **Package**: `@openform-steps/react`
- **Goal**: Extract built-in validation error strings ("is required", "must be a valid email", "Submit Form", "Continue", "Back") into a configurable dictionary/locale provider, supporting languages like Spanish, French, German, Hindi, and Japanese.
- **Reference**: Allow passing `locale?: FormLocale` prop into `<FormRenderer />`.

---

### Issue #3: Generic Webhook Dispatcher with Retry Logic
- **Difficulty**: Intermediate
- **Package**: `@openform-steps/core`, `@openform-steps/web`
- **Goal**: Provide a lightweight dispatcher utility `dispatchWebhook(submission, webhookUrl, options)` that sends JSON payloads to user-configured webhook destinations (e.g. Zapier, Make, Slack webhooks, custom endpoints) with exponential backoff on network failures.

---

### Issue #4: Matrix / Likert Scale Grid Field Type
- **Difficulty**: Intermediate / Advanced
- **Package**: `@openform-steps/core`, `@openform-steps/react`
- **Goal**: Add a `matrix` field type allowing survey creators to evaluate multiple statements along a shared rating scale (e.g. "Strongly Disagree" to "Strongly Agree") in an accessible table format with keyboard arrow navigation.

---

### Issue #5: Submission Print / PDF Export Stylesheet
- **Difficulty**: Beginner
- **Package**: `@openform-steps/react`, `@openform-steps/web`
- **Goal**: Add `@media print` CSS rules so that submitting a form or viewing response details can be cleanly exported or printed to PDF without extraneous UI controls, sidebars, or dark backgrounds.
