import { test, expect } from '@playwright/test';

test.describe('Blackbox: Data Retrieval from PocketBase Database', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('Landing page loads real featured products from PocketBase', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify real PocketBase products appear (not static fallback)
        await expect(page.locator('body')).toContainText('iPhone');

        // Verify no static fallback names appear
        const bodyText = await page.locator('body').textContent() || '';
        expect(bodyText).not.toContain('ProPhone');
        expect(bodyText).not.toContain('ProBook');
    });

    test('Products page displays real catalog from PocketBase', async ({ page }) => {
        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        // Real PB products should be visible
        await expect(page.locator('body')).toContainText('iPhone');
        await expect(page.locator('body')).toContainText('MacBook');
        await expect(page.locator('body')).toContainText('AirPods');

        // Static fallback names should NOT appear
        const bodyText = await page.locator('body').textContent() || '';
        expect(bodyText).not.toContain('ProPhone');
        expect(bodyText).not.toContain('ProWatch');
        expect(bodyText).not.toContain('ProBuds');
    });

    test('Product detail page shows correct PocketBase data', async ({ page }) => {
        await page.goto('/products/iphone-15-pro');
        await page.waitForLoadState('networkidle');

        // Verify real product name and description
        await expect(page.locator('body')).toContainText('iPhone 15 Pro');
        await expect(page.locator('body')).toContainText('Titanium');

        // Verify price from PB (99900 cents = $999)
        await expect(page.locator('body')).toContainText('999');

        // Verify Add to Bag button
        await expect(page.locator('button:has-text("Add to Bag")')).toBeVisible();
    });

    test('Category filtering returns correct PocketBase subset', async ({ page }) => {
        await page.goto('/products?category=smartphones');
        await page.waitForLoadState('networkidle');

        // Should show real smartphone products
        await expect(page.locator('body')).toContainText('iPhone');
        await expect(page.locator('body')).toContainText('Samsung');
    });

    test('Search returns matching PocketBase products', async ({ page }) => {
        await page.goto('/products?search=macbook');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toContainText('MacBook');
    });
});
