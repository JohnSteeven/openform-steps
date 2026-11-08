# Contributing to OpenForm Steps

Thank you for your interest in contributing to **OpenForm Steps**! We are committed to building an accessible, high-performance, and reliable open-source library that developers worldwide can adopt.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat everyone with respect and kindness.

---

## Development Setup

### Prerequisites

- **Node.js**: v20 or v22 LTS
- **pnpm**: v9 or v10 (`npm install -g pnpm`)
- **Git**

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/JohnSteeven/openform-steps.git
cd openform-steps

# Install dependencies across all packages
pnpm install

# Run the local development server
pnpm dev
```

---

## Testing & Quality Standards

Before opening a pull request:

1. **Run Unit and Integration Tests**:
   ```bash
   pnpm test
   ```
2. **Type Check**:
   ```bash
   pnpm typecheck
   ```
3. **Build All Packages**:
   ```bash
   pnpm build
   ```
4. **Accessibility Checks**:
   - Ensure all interactive elements have visible focus rings.
   - Verify keyboard navigation works smoothly (Tab, Enter, Space).
   - Ensure touch targets are at least $44 \times 44\text{ px}$.

---

## Pull Request Guidelines

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Keep commits concise and meaningful following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add signature pad custom field`
   - `fix: resolve tab focus trap in modal`
   - `docs: update API reference for custom fields`
3. Ensure no private keys, passwords, or unrelated workspace files are committed.
4. Submit your pull request against the `main` branch.

