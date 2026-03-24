---
paths:
  - "**/*.ts"
  - "**/*.vue"
---
# Testing Requirements

## Test Coverage

Aim for 80%+ on business logic:
- Pure functions (utils, calculations, formatters)
- Store actions (save, delete, merge)
- Offline queue operations
- Data transformations

## Test-Driven Development

For new features and bug fixes:
1. Write test first (RED) - it should FAIL
2. Write minimal implementation (GREEN) - it should PASS
3. Refactor (IMPROVE) - tests still PASS
4. Verify coverage

## Commands

```bash
pnpm test                    # Watch mode
pnpm test -- --run           # Run once
pnpm test -- --run <path>    # Specific file
pnpm test -- --coverage      # With coverage
```

## Agent Support

- **tdd-guide** - Use for new features, enforces write-tests-first
- **e2e-runner** - Playwright E2E testing for critical user flows
