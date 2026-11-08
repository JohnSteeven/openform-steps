# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

Security is a paramount priority for **OpenForm Steps**. We take security issues seriously and appreciate responsible disclosure.

If you discover a security vulnerability in OpenForm Steps:

1. **Do not disclose it publicly** in a public GitHub issue, discussion, or social media.
2. Email the maintainer team or submit a private security advisory via GitHub:
   - Repository: [https://github.com/JohnSteeven/openform-steps/security/advisories](https://github.com/JohnSteeven/openform-steps/security/advisories)
3. Include detailed steps to reproduce the vulnerability, including:
   - Affected package (`@openform-steps/core`, `@openform-steps/react`, `@openform-steps/builder`, or `@openform-steps/web`).
   - Node.js and browser version.
   - Proof-of-concept payload or sample form schema.

We will acknowledge receipt of your report within 48 hours and work with you to remediate and publish an advisory.

---

## Core Security Safeguards

- **No `eval` or dynamic code execution**: Form conditional logic uses a deterministic AST evaluator rather than string evaluation.
- **Sanitized CSV export**: Leading characters (`=`, `+`, `-`, `@`) in export cells are sanitized to prevent formula injection attacks.
- **Client-Side Isolation**: By default, no form data is transmitted to external endpoints without explicit user-provided backend integration.
