---
title: "Cypress Component Isolation Issues"
pubDate: 2025-11-06
tags: ["cypress", "testing", "playwright", "e2e"]
---

Working on a personal project, I hit a frustrating limitation with Cypress: component state bleeding between tests.

## The Problem

Cypress mounts components in the same browser context across tests. Even with `beforeEach` cleanup, some state persists:
- Event listeners accumulate
- CSS-in-JS styles duplicate
- Global window objects leak between tests
- Memory usage grows linearly with test count

Example that failed intermittently:

```javascript
describe('User form', () => {
  beforeEach(() => {
    cy.mount(<UserForm />)
  })

  it('validates email', () => {
    cy.get('[data-testid="email"]').type('invalid')
    cy.get('[data-testid="error"]').should('contain', 'Invalid email')
  })

  it('submits successfully', () => {
    cy.get('[data-testid="email"]').type('valid@example.com')
    cy.get('[data-testid="submit"]').click()
    // Fails intermittently - previous test's error message still in DOM
  })
})
```

## Why This Happens

Cypress reuses the browser instance. Components unmount, but:
- The iframe stays alive
- JavaScript heap isn't cleared
- Event listeners require explicit cleanup
- Third-party libraries may not clean up properly

## The Workaround

Force full remount between tests:

```javascript
afterEach(() => {
  cy.window().then((win) => {
    win.location.reload()
  })
})
```

This works but adds ~500ms per test. With 200+ component tests, that's 100 seconds of wasted time.

## Playwright Does This Better

Playwright's component testing uses isolated browser contexts per test. Each test gets:
- Fresh browser context
- Clean JavaScript heap
- No state leakage
- Parallel execution by default

Same test in Playwright:

```javascript
test('submits successfully', async ({ mount }) => {
  const component = await mount(<UserForm />)
  await component.getByTestId('email').fill('valid@example.com')
  await component.getByTestId('submit').click()
  // Always works - completely isolated from previous test
})
```

No manual cleanup. No intermittent failures. No performance workaround.

## Migration Considerations

Switching to Playwright would mean:
- Rewriting 200+ Cypress tests (different API)
- Learning new assertion patterns
- Different debugging workflow
- But: genuine test isolation and faster execution

The isolation model is compelling. Cypress is great for E2E, but for component testing, Playwright's architecture is superior.

Might be time to migrate.
