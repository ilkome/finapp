---
name: tdd-workflow
description: Use this skill when implementing new features or fixing bugs. Enforces test-driven development workflow with Vitest. Write tests first, then implement, then refactor.
---

# TDD Workflow Skill

Test-driven development workflow for Finapp using Vitest.

## When to Activate

- Implementing new features (stores, composables, utils)
- Fixing bugs (reproduce with test first)
- Refactoring existing code (ensure tests exist before changing)
- Adding Convex function logic that can be unit-tested

## TDD Cycle

### 1. RED - Write Failing Test

```typescript
// app/components/amount/__tests__/getTotal.test.ts
import { describe, expect, it } from 'vitest'
import { getTotal } from '../getTotal'

describe('getTotal', () => {
  it('calculates expense total from transactions', () => {
    const trns = [
      { amount: 100, type: 0, categoryId: 'food' },
      { amount: 200, type: 0, categoryId: 'transport' },
    ]
    expect(getTotal(trns).expense).toBe(300)
  })

  it('excludes adjustment transactions from totals', () => {
    const trns = [
      { amount: 100, type: 0, categoryId: 'food' },
      { amount: 500, type: 0, categoryId: 'adjustment' },
    ]
    expect(getTotal(trns).expense).toBe(100)
  })
})
```

Run: `pnpm test -- --run app/components/amount/__tests__/getTotal.test.ts`

Verify test FAILS (red).

### 2. GREEN - Minimal Implementation

Write the minimum code to make the test pass. No optimization, no edge cases beyond what's tested.

Run test again - verify it PASSES (green).

### 3. REFACTOR - Improve

- Remove duplication
- Improve naming
- Optimize if needed
- Run tests again - verify still green

## Project Test Conventions

### File Location
Tests live next to the code they test:
```
app/components/amount/
  getTotal.ts
  __tests__/
    getTotal.test.ts
```

### Running Tests
```bash
pnpm test                    # Run all tests (watch mode)
pnpm test -- --run           # Run once, no watch
pnpm test -- --run <path>    # Run specific file
pnpm test -- --coverage      # With coverage report
```

### Test Structure
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('featureName', () => {
  beforeEach(() => {
    // Reset state between tests
  })

  describe('methodName', () => {
    it('does X when Y', () => {
      // Arrange
      const input = createTestInput()

      // Act
      const result = methodName(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('throws when input is invalid', () => {
      expect(() => methodName(null)).toThrow()
    })
  })
})
```

### Mocking Patterns

#### Mock Convex Client
```typescript
import { vi } from 'vitest'

const mockClient = {
  query: vi.fn(),
  mutation: vi.fn(),
}

vi.mock('~/composables/useConvexClient', () => ({
  useConvexClient: () => mockClient,
}))
```

#### Mock Pinia Store
```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

#### Mock localStorage (for offline queue)
```typescript
const mockStorage = new Map<string, string>()

vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
})
```

## What to Test

### Must Test
- Pure functions (utils, calculations, formatters)
- Store actions with business logic (save, delete, merge)
- Offline queue operations (push, replay, merge)
- Convex validator logic
- Data transformations

### Should Test
- Composables with logic (not just wrapper composables)
- Error handling paths
- Edge cases (empty arrays, null values, `local_` IDs)

### Skip
- Simple getter composables (no logic)
- Vue template rendering (use E2E for that)
- Auto-generated Convex types

## Coverage Target

Aim for 80%+ coverage on business logic (stores, utils, offline queue). Don't chase coverage on thin wrappers or UI components.
