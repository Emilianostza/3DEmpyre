# CI/CD Quality Gates & Local Development Checks

This document describes the automated quality gates that ensure code reliability and consistency across the project.

## Overview

The project uses a multi-layer quality assurance strategy:

1. **Pre-commit Hooks** (Local) - Run before commits
2. **GitHub Actions CI** (Remote) - Run on every push/PR
3. **Deployment Checks** (Netlify) - Run before production deployment

---

## 1. Pre-Commit Hooks (Local Development)

### Installation

Pre-commit hooks are automatically installed when running `npm install` thanks to Husky.

```bash
npm install
# Husky installs git hooks automatically via "prepare" script
```

### What Runs

When you attempt to commit code, the following checks run automatically:

```bash
git commit -m "Your message"
→ Pre-commit hook runs
  ├─ lint-staged (format & lint staged files)
  │  ├─ ESLint for .ts/.tsx files (with --fix)
  │  └─ Prettier for all files
  └─ TypeScript type check (tsc --noEmit)
```

### Skipping Hooks (Not Recommended)

```bash
# Skip hooks only in emergencies
git commit --no-verify -m "emergency fix"
```

### Staged Files Configuration

Edit `.lint-staged` in `package.json` to customize what runs on each file type:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,json,md}": ["prettier --write"]
  }
}
```

---

## 2. GitHub Actions CI Pipeline

### Workflow File

Location: `.github/workflows/ci.yml`

### Jobs

#### 2.1 Quality Gate (10-15 seconds)

Checks code style and TypeScript types across the entire codebase:

```bash
npm run lint          # ESLint on src/
npx tsc --noEmit      # TypeScript type checking
npx prettier --check  # Code formatting check
```

**Failure means**: Linting errors, type mismatches, or formatting issues

**Fix locally**:

```bash
npm run lint:fix      # Auto-fix ESLint + Prettier issues
npm run format        # Auto-format code
npx tsc --noEmit      # Re-check types
```

#### 2.2 Tests (20-30 seconds)

Runs unit and integration tests:

```bash
npm run test:run      # Vitest (single run)
npm run test:coverage # Generate coverage reports
```

**Failure means**: Test failures or coverage below threshold

**Fix locally**:

```bash
npm test              # Watch mode for development
npm run test:run      # Single run (same as CI)
```

#### 2.3 Build (10-15 seconds)

Verifies the production build works:

```bash
npm run build         # Vite production build
# Checks: Bundle size < 5MB, no errors
```

**Failure means**: Build errors or bundle too large

**Fix locally**:

```bash
npm run build         # Create production bundle
npm run preview       # Test production build locally
```

#### 2.4 Security (5-10 seconds)

Scans for known vulnerabilities:

```bash
npm audit --audit-level=moderate
# Checks for critical/high vulnerabilities
```

**Failure means**: Known CVEs in dependencies

**Fix**:

```bash
npm audit fix         # Auto-fix if possible
npm update            # Update dependencies to patched versions
```

#### 2.5 Dependencies (5 seconds)

Checks for outdated or conflicting packages:

```bash
npm outdated          # List outdated packages
npm ci --dry-run      # Verify lock file integrity
```

---

## 3. Linting Configuration

### ESLint

**Config file**: `eslint.config.js` (flat config format)

**Rules**:

- ✅ React best practices (no JSX scope, hook rules)
- ✅ TypeScript strict mode
- ✅ Console statements (warn on log, error on debugger)
- ✅ Unused variables (with underscore prefix escape)
- ⚠️ React Hooks exhaustive deps (disabled due to flat config compatibility)

**Run locally**:

```bash
npm run lint          # Check all files
npm run lint:fix      # Auto-fix issues
```

### Prettier

**Config file**: `.prettierrc.json`

**Settings**:

- 100 character line width
- Single quotes
- 2-space indentation
- Trailing commas (ES5)

**Run locally**:

```bash
npm run format        # Format all files
npm run format:check  # Check without fixing
```

---

## 4. TypeScript

### Configuration

**Config file**: `tsconfig.json`

**Enabled checks**:

- Strict mode (`strict: true`)
- No implicit any
- Exact optional properties
- Module resolution: bundler

**Run locally**:

```bash
npx tsc --noEmit      # Type check without emitting
```

---

## 5. Testing

### Test Framework

**Framework**: Vitest (configured in `vite.config.ts`)

**Environment**: happy-dom (lightweight)

**Run locally**:

```bash
npm test              # Watch mode
npm run test:run      # Single run (CI mode)
npm run test:ui       # Browser UI
npm run test:coverage # Coverage report
```

### Test Files

- Location: `src/**/*.test.ts` or `src/__tests__/**/*.ts`
- Setup: `src/__tests__/setup.ts` (mocks browser/test globals)

---

## 6. Branch Protection Rules (Recommended)

Configure in GitHub repository settings:

```
Branch: main
Require:
  ✓ Status checks to pass before merging
    - ci (quality)
    - test
    - build
    - security
  ✓ Code review from at least 1 approver
  ✓ Conversation resolution
  ✓ Signed commits (optional)
```

---

## 7. Common Issues & Solutions

### Issue: "Pre-commit hook failed"

**Cause**: ESLint or TypeScript errors in staged files

**Solution**:

```bash
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format code
git add .             # Re-stage files
git commit ...        # Try again
```

### Issue: "Build exceeds 5MB limit"

**Cause**: Large bundle size

**Solution**:

```bash
npm run build         # Build and check
npx vite-bundle-visualizer  # Analyze bundle
# Look for large dependencies
npm list <package>    # Check what depends on it
```

### Issue: "npm audit failed"

**Cause**: Known vulnerabilities in dependencies

**Solution**:

```bash
npm audit             # See vulnerabilities
npm update            # Update to patched versions
npm audit fix         # Auto-fix if possible
```

### Issue: "Types check failed"

**Cause**: TypeScript compilation errors

**Solution**:

```bash
npx tsc --noEmit      # See all errors
# Fix files:
# - Add missing types
# - Use | undefined for optional values
# - Remove 'as any' if possible
```

---

## 8. CI/CD Pipeline Metrics

### Current Status

| Check    | Status        | Time | Pass Rate |
| -------- | ------------- | ---- | --------- |
| Lint     | ✅ Configured | 10s  | -         |
| Types    | ✅ Configured | 15s  | -         |
| Tests    | ✅ Configured | 30s  | -         |
| Build    | ✅ Configured | 15s  | 100%      |
| Security | ✅ Configured | 10s  | -         |

### Total Pipeline Time

~90 seconds for full CI run (all jobs in parallel)

---

## 9. Development Workflow

### Typical Day

```bash
# Start dev
npm run dev

# Make changes
# ... edit src/ files ...

# Stage and commit
git add .
git commit -m "feat: add feature"
# → Pre-commit hooks run automatically
# → Code formatted and types checked

# Push (optional, Netlify builds automatically)
git push

# → GitHub Actions CI runs
# → Tests run
# → Build verified
# → Security scan runs
# → All checks pass? ✅ Deploy!
```

### Debugging Failed Checks

```bash
# Run checks locally before pushing
npm run lint          # Check ESLint
npm run format:check  # Check Prettier
npx tsc --noEmit      # Check types
npm run test:run      # Run tests
npm run build         # Build for production

# Fix issues
npm run lint:fix      # Auto-fix ESLint
npm run format        # Auto-format
npm run test:run      # Re-run tests after fixes
```

---

## 10. Future Enhancements

### Planned

- [ ] E2E tests with Playwright (20-40s)
- [ ] Performance budgeting (Lighthouse)
- [ ] OWASP dependency scanning
- [ ] SonarQube/CodeFactor integration
- [ ] Automated dependency updates (Dependabot)

### Optional

- [ ] Commit message linting (commitlint)
- [ ] Branch naming conventions
- [ ] Code coverage enforcement (>50%)
- [ ] Accessibility scanning (axe)

---

## 11. Resources

- [ESLint Docs](https://eslint.org)
- [Prettier Docs](https://prettier.io)
- [Husky Docs](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vitest](https://vitest.dev)

---

## Quick Reference

```bash
# Pre-commit checks
git commit ...                # Runs automatically

# Local linting
npm run lint                  # Check
npm run lint:fix              # Fix ESLint
npm run format                # Fix Prettier
npx tsc --noEmit              # Type check

# Local testing
npm test                      # Watch mode
npm run test:run              # Single run
npm run test:coverage         # Coverage report

# Local building
npm run build                 # Production build
npm run preview               # Test production

# Security
npm audit                     # Check vulnerabilities
npm audit fix                 # Fix vulnerabilities

# CI/CD information
# GitHub Actions: .github/workflows/ci.yml
# Linting: eslint.config.js
# Formatting: .prettierrc.json
# Pre-commit: .husky/pre-commit
# Tests: src/__tests__/
```
