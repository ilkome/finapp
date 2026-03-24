---
name: e2e-testing
description: End-to-end testing patterns with Playwright. Use when creating, maintaining, or debugging E2E tests for critical user flows.
---

# E2E Testing Skill

Playwright-based E2E testing patterns for Finapp.

## When to Activate

- Creating new E2E tests for user flows
- Debugging flaky or failing E2E tests
- Setting up Playwright for the first time
- Testing critical paths (auth, transactions, wallet management)

## Setup

```bash
pnpm add -D @playwright/test
npx playwright install

npx playwright test                        # Run all
npx playwright test --headed               # See browser
npx playwright test --debug                # Debug with inspector
npx playwright show-report                 # View HTML report
```

## Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3050',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3050,
    reuseExistingServer: true,
  },
})
```

## Page Object Model

```typescript
// e2e/pages/TransactionPage.ts
import type { Page } from '@playwright/test'

export class TransactionPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  async addExpense(amount: number, category: string) {
    await this.page.getByTestId('add-transaction').click()
    await this.page.getByTestId('amount-input').fill(String(amount))
    await this.page.getByTestId(`category-${category}`).click()
    await this.page.getByTestId('save-button').click()
  }

  async getBalance() {
    return this.page.getByTestId('total-balance').textContent()
  }
}
```

## Test Patterns

### Auth Flow
```typescript
import { test, expect } from '@playwright/test'

test('user can sign in', async ({ page }) => {
  await page.goto('/login')
  await page.waitForSelector('[data-testid="login-form"]')
  await page.getByTestId('email-input').fill('test@example.com')
  await page.getByTestId('password-input').fill('password')
  await page.getByTestId('login-button').click()
  await expect(page).toHaveURL('/')
})
```

### Transaction CRUD
```typescript
test('user can create expense', async ({ page }) => {
  const txPage = new TransactionPage(page)
  await txPage.addExpense(100, 'food')
  await expect(page.getByTestId('transaction-list')).toContainText('100')
})
```

## Best Practices

### Locators
- Prefer `data-testid`: `page.getByTestId('...')`
- Use role-based: `page.getByRole('button', { name: '...' })`
- Avoid CSS selectors tied to styling

### Waits
```typescript
// WRONG: Arbitrary timeout
await page.waitForTimeout(2000)

// CORRECT: Wait for condition
await page.waitForResponse('**/api/**')
await page.waitForSelector('[data-testid="loaded"]')
await expect(page.getByTestId('list')).toBeVisible()
```

### SPA-Specific
Since Finapp is SPA (`ssr: false`):
- Always wait for client-side render after navigation
- Use `page.waitForSelector` for dynamic content
- Account for Convex WebSocket connection time on first load
- Offline queue tests: use `page.context().setOffline(true/false)`

### Test Isolation
- Each test should be independent
- Use `test.beforeEach` for common setup (auth, navigation)
- Don't depend on test execution order

## Flaky Test Handling

```typescript
// Quarantine flaky tests
test('flaky: chart renders correctly', async ({ page }) => {
  test.fixme(true, 'Flaky - timing issue with echarts render')
})

// Detect flakiness: npx playwright test --repeat-each=10
```

## Critical User Journeys to Test

1. **Auth**: Sign in, sign out, session persistence
2. **Transactions**: Create expense/income/transfer, edit, delete
3. **Wallets**: Create, edit, delete, balance calculation
4. **Categories**: Create, edit, nested categories
5. **Statistics**: Date range filtering, category totals
6. **Offline**: Create while offline, sync on reconnect
