import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';

const AUTH_STATE = 'playwright/.auth/user.json';
const hasAuth = existsSync(AUTH_STATE);

test.describe('Checkout Flow — Unauthenticated', () => {
	test('checkout page redirects unauthenticated users to login', async ({ page }) => {
		await page.goto('/checkout');
		await page.waitForURL(/\/login/, { timeout: 5000 });
		await expect(page).toHaveURL(/\/login/);
	});

	test('shipping step card fields are absent when redirected', async ({ page }) => {
		await page.goto('/checkout');
		await page.waitForURL(/\/login/, { timeout: 5000 });
		await expect(page.locator('#cardNumber')).not.toBeAttached();
		await expect(page.locator('#expiry')).not.toBeAttached();
		await expect(page.locator('#cvv')).not.toBeAttached();
	});
});

test.describe('Checkout Flow — Authenticated', () => {
	test.skip(!hasAuth, 'PocketBase auth state not available — skipping authenticated tests');

	test.use({ storageState: AUTH_STATE });

	test('checkout page structure has Shipping and Review steps only', async ({ page }) => {
		await page.goto('/checkout');
		await expect(page.locator('.step-label')).toHaveCount(2);
		await expect(page.locator('.step-label').nth(0)).toHaveText('Shipping');
		await expect(page.locator('.step-label').nth(1)).toHaveText('Review');
		await expect(page.locator('.step-label:has-text("Payment")')).not.toBeAttached();
	});

	test('shipping validation prevents continuing with empty fields', async ({ page }) => {
		await page.goto('/checkout');
		await page.click('button:has-text("Continue to Review")');
		await expect(page.locator('.field-error').first()).toBeVisible();
		await expect(page.locator('.step-circle.active')).toContainText('1');
	});

	test('valid shipping form advances to review step', async ({ page }) => {
		await page.goto('/checkout');

		await page.fill('#fullName', 'John Doe');
		await page.fill('#address1', '123 Main St');
		await page.fill('#city', 'Jakarta');
		await page.fill('#state', 'DKI Jakarta');
		await page.fill('#zip', '12345');
		await page.fill('#phone', '08123456789');
		await page.click('button:has-text("Continue to Review")');

		await expect(page.locator('h2:has-text("Review Your Order")')).toBeVisible();
		await expect(page.locator('#cardNumber')).not.toBeAttached();
	});
});
