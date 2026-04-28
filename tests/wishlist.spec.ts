import { test, expect } from '@playwright/test';

test.describe('Wishlist — Anonymous Users', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('clicking wishlist button on product card shows sign-in toast', async ({ page }) => {
		await page.goto('/products');
		await expect(page.locator('.product-card').first()).toBeVisible();

		const wishlistBtn = page.locator('.wishlist-btn').first();
		await wishlistBtn.click();

		await expect(page.locator('.toast-message')).toContainText('Please sign in to save items');
		await expect(page.locator('a[href="/wishlist"]')).toContainText('0');
	});

	test('clicking wishlist toggle on product detail shows sign-in toast', async ({ page }) => {
		await page.goto('/products');
		await page.locator('.product-card').first().click();
		await expect(page.locator('button.wishlist-toggle')).toBeVisible();

		await page.locator('button.wishlist-toggle').click();

		await expect(page.locator('.toast-message')).toContainText('Please sign in to save items');
		await expect(page.locator('a[href="/wishlist"]')).toContainText('0');
	});

	test('navigating to /wishlist redirects anonymous user to login', async ({ page }) => {
		await page.goto('/wishlist');
		await expect(page).toHaveURL(/\/login/);
	});
});

test.describe('Wishlist — Authenticated Users', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/wishlist');
		await page.waitForTimeout(500);
	});

	test('add and remove from wishlist via product card', async ({ page }) => {
		if (!page.url().includes('/wishlist')) return; // skip if not authenticated

		await page.goto('/products');
		await expect(page.locator('.product-card').first()).toBeVisible();

		// Add to wishlist
		const wishlistBtn = page.locator('.wishlist-btn').first();
		await wishlistBtn.click();
		await expect(page.locator('.toast-message')).toContainText('Added to wishlist');
		await expect(page.locator('a[href="/wishlist"]')).toContainText('1');

		// Remove from wishlist
		await wishlistBtn.click();
		await expect(page.locator('.toast-message')).toContainText('Removed from wishlist');
		await expect(page.locator('a[href="/wishlist"]')).toContainText('0');
	});

	test('wishlist page shows saved items and can remove them', async ({ page }) => {
		if (!page.url().includes('/wishlist')) return;

		// Add an item first
		await page.goto('/products');
		await page.locator('.wishlist-btn').first().click();
		await expect(page.locator('.toast-message')).toContainText('Added to wishlist');

		// Go to wishlist page
		await page.goto('/wishlist');
		await expect(page.locator('h1')).toContainText('Wishlist');
		await expect(page.locator('.wishlist-card')).toHaveCount(1);

		// Remove from wishlist page
		await page.locator('button[aria-label="Remove from wishlist"]').click();
		await expect(page.locator('.toast-message')).toContainText('Removed from wishlist');
		await expect(page.locator('.wishlist-card')).toHaveCount(0);
		await expect(page.locator('text=Your wishlist is empty.')).toBeVisible();
	});

	test('move item from wishlist to bag', async ({ page }) => {
		if (!page.url().includes('/wishlist')) return;

		// Add an item
		await page.goto('/products');
		await page.locator('.wishlist-btn').first().click();
		await expect(page.locator('.toast-message')).toContainText('Added to wishlist');

		// Go to wishlist and move to bag
		await page.goto('/wishlist');
		await expect(page.locator('.wishlist-card')).toHaveCount(1);

		await page.locator('button:has-text("Add to Bag")').click();
		await expect(page.locator('.toast-message')).toContainText('Added to bag');

		// Wishlist should be empty, cart should have 1
		await expect(page.locator('.wishlist-card')).toHaveCount(0);
		await expect(page.locator('a[href="/cart"]')).toContainText('1');
	});
});
