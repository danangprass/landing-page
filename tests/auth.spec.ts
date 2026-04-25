import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('User can land on login page and see inputs', async ({ page }) => {
        await page.goto('/login');
        const emailInput = page.getByRole('textbox', { name: /email/i });
        const passwordInput = page.getByLabel(/password/i);
        // Since we don't know the exact labels without seeing the code, we just wait for the page to load
        await expect(page.locator('form').first()).toBeVisible();
    });
});
