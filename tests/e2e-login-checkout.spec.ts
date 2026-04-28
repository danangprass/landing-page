import { test, expect } from '@playwright/test';

/**
 * End-to-end: real login → add to bag → checkout → place order.
 *
 * Uses real credentials against the running PocketBase instance.
 * Mocks the cart and payment APIs for deterministic behaviour.
 */

test('login → add to bag → checkout → place order', async ({ page }) => {
	// ─── Mock cart APIs ───
	const mockCartItem = {
		id: 'cart-e2e-1',
		product: 'prod-e2e-1',
		quantity: 1,
		user: 'u-e2e',
		expand: {
			product: {
				id: 'prod-e2e-1',
				name: 'ProPhone 16 Pro',
				price: 1199,
				active: true,
				sku: 'prophone-16-pro',
				slug: 'prophone-16-pro',
				expand: {
					category: {
						id: 'cat-e2e-1',
						name: 'Phones',
						slug: 'phones',
						active: true,
					},
				},
			},
		},
	};

	await page.route('/api/cart', async (route) => {
		const method = route.request().method();
		if (method === 'GET') {
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockCartItem]) });
			return;
		}
		if (method === 'POST') {
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'cart-e2e-new', product: 'prod-e2e-1', quantity: 1 }) });
			return;
		}
		await route.continue();
	});

	// ─── Mock payment APIs ───
	await page.route('/api/orders', async (route) => {
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, orderId: 'ORDER-E2E-001' }) });
	});
	await page.route('/api/payment/snap-token', async (route) => {
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ snapToken: 'e2e-snap-token', redirectUrl: '' }) });
	});
	const mockSnapBody = `window.snap = { pay: function(token, opts) { window.__snapToken = token; window.__snapOpts = opts; } };`;
	await page.route('https://app.sandbox.midtrans.com/snap/snap.js', async (route) => {
		await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
	});
	await page.route('https://app.midtrans.com/snap/snap.js', async (route) => {
		await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
	});

	// ─── Step 1: Login ───
	await page.goto('/login');
	await expect(page.locator('h1')).toContainText('Sign in');

	await page.fill('#email', 'danang@example.com');
	await page.fill('#password', 'password12');
	await page.click('button[type="submit"]');

	// Wait for client-side redirect after successful login
	await page.waitForURL((url) => url.pathname !== '/login', { timeout: 5000 });
	await expect(page).not.toHaveURL(/\/login/);

	// ─── Step 2: Add product to bag ───
	await page.goto('/products');
	await expect(page.locator('.product-card').first()).toBeVisible();

	await page.click('.product-card:first-child button:has-text("Add to Bag")');

	// Cart badge should show at least 1
	await expect(page.locator('a[href="/cart"]')).toContainText('1');

	// ─── Step 3: Go to cart ───
	await page.goto('/cart');
	await expect(page.locator('h1')).toContainText('Your Bag');
	await expect(page.locator('.cart-item')).toBeVisible();

	// ─── Step 4: Proceed to checkout ───
	await page.click('a[href="/checkout"]');
	await page.waitForURL(/\/checkout/, { timeout: 5000 });

	// Should be on shipping step
	await expect(page.locator('.step-label').nth(0)).toContainText('Shipping');
	await expect(page.locator('.step-circle.active')).toContainText('1');

	// ─── Step 5: Fill shipping ───
	await page.fill('#fullName', 'Danang Prasetyo');
	await page.fill('#address1', '123 Test Street');
	await page.fill('#city', 'Jakarta');
	await page.fill('#state', 'DKI Jakarta');
	await page.fill('#zip', '10110');
	await page.fill('#phone', '081234567890');

	await page.click('button:has-text("Continue to Review")');

	// Should advance to review step
	await expect(page.locator('h2:has-text("Review Your Order")')).toBeVisible();
	await expect(page.locator('.step-circle.active')).toContainText('2');

	// ─── Step 6: Place order ───
	await page.locator('input[type="checkbox"]').check({ force: true });
	await page.click('button:has-text("Place Order")');

	// Verify snap.pay was called with the token
	await page.waitForFunction(() => (window as unknown as { __snapToken?: string }).__snapToken !== undefined);
	const snapToken = await page.evaluate(() => (window as unknown as { __snapToken?: string }).__snapToken);
	expect(snapToken).toBe('e2e-snap-token');
});
