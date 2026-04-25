import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test('User can navigate product catalog', async ({ page }) => {
        await page.goto('/products');
        await expect(page.locator('body')).toBeVisible();
    });
});
