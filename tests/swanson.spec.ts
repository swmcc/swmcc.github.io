import { test, expect } from '@playwright/test';

test('swanson overlay survives asking a question', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  let navigated = false;
  page.on('framenavigated', () => { navigated = true; });

  await page.goto('/');
  navigated = false;

  await page.click('#swanson-toggle');
  await expect(page.locator('#swanson-modal')).toBeVisible();

  await page.fill('#swanson-input', 'what is grub?');
  await page.press('#swanson-input', 'Enter');
  await page.waitForTimeout(2000);

  expect(errors).toEqual([]);
  expect(navigated).toBe(false);
  await expect(page.locator('#swanson-modal')).toBeVisible();
  await expect(page.locator('.swanson-msg-bot').first()).toBeVisible();
});
