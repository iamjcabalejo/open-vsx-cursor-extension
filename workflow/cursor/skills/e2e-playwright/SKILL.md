---
name: e2e-playwright
description: Write reliable Playwright E2E tests with Page Object Model, stable selectors, and proper waits. Use when creating or maintaining E2E tests with e2e-runner.
---

# E2E Playwright

## Selector Priority
1. `getByRole('button', { name: 'Submit' })` — best for accessibility
2. `getByLabelText('Email')` — forms
3. `getByTestId('submit-btn')` — add `data-testid` when needed
4. `getByPlaceholderText`, `getByTitle` — fallbacks
5. Avoid: deep CSS, `:nth-child`, XPath for layout

## Waiting
- Use Playwright auto-waiting; avoid `page.waitForTimeout()`
- Prefer: `expect(locator).toBeVisible()`, `locator.click()` (auto-waits)
- For network: `page.waitForResponse()`, `page.waitForRequest()`

## Page Object Pattern
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  email = this.page.getByLabel('Email');
  password = this.page.getByLabel('Password');
  submit = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

## Test Structure
```typescript
test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Auth if needed
  });

  test('completes purchase', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.addItem('Product A');
    await cart.goToCheckout();
    // ...
  });
});
```

## Config (playwright.config.ts)
- `retries: 1` for CI flakiness
- `trace: 'on-first-retry'` for debugging
- `screenshot: 'only-on-failure'`
- Parallel workers for speed

## Isolation
- Each test independent; no shared mutable state
- Seed/reset data in `beforeEach` if needed
- Use unique test data (timestamps, UUIDs) to avoid conflicts
