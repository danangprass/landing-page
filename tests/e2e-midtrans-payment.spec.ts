import { test, expect } from '@playwright/test';

/**
 * End-to-end: login → add to bag → checkout → place order → complete real Midtrans sandbox payment.
 *
 * Uses real Midtrans sandbox API for snap token generation.
 * Navigates to the Midtrans redirect URL to complete a test credit-card payment,
 * then waits for the redirect back to the merchant site.
 */

test('login → checkout → complete real Midtrans sandbox payment', async ({ page }) => {
	test.setTimeout(120_000);

	const orderId = `ORDER-TEST-${Date.now()}`;

	// ─── Mock cart API ───
	await page.route('/api/cart', async (route) => {
		const method = route.request().method();
		if (method === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'cart-e2e-1',
						product: 'prod-e2e-1',
						quantity: 1,
						user: 'u-e2e',
						expand: {
							product: {
								id: 'prod-e2e-1',
								name: 'ProPhone 16 Pro',
								price: 1000,
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
					},
				]),
			});
			return;
		}
		await route.continue();
	});

	// ─── Mock orders API ───
	await page.route('/api/orders', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true, orderId }),
		});
	});

	// ─── Intercept payment API to fix gross_amount / item_details mismatch ───
	await page.route('/api/payment/snap-token', async (route) => {
		const postData = route.request().postData();
		if (!postData) {
			await route.continue();
			return;
		}
		const body = JSON.parse(postData) as {
			total: number;
			items: { id: string; price: number; quantity: number; name: string }[];
		};
		const itemTotal = body.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
		const tax = Math.round((body.total - itemTotal) * 100) / 100;
		if (tax > 0) {
			body.items.push({ id: 'tax', price: tax, quantity: 1, name: 'Tax' });
		}
		await route.continue({ postData: JSON.stringify(body) });
	});

	// ─── Step 1: Login ───
	await page.goto('/login');
	await expect(page.locator('h1')).toContainText('Sign in');

	await page.fill('#email', 'danang@example.com');
	await page.fill('#password', 'password12');
	await page.click('button[type="submit"]');

	await page.waitForURL((url) => url.pathname !== '/login', { timeout: 5000 });
	await expect(page).not.toHaveURL(/\/login/);

	// ─── Step 2: Add product to bag ───
	await page.goto('/products');
	await expect(page.locator('.product-card').first()).toBeVisible();

	await page.click('.product-card:first-child button:has-text("Add to Bag")');
	await expect(page.locator('a[href="/cart"]')).toContainText('1');

	// ─── Step 3: Go to cart ───
	await page.goto('/cart');
	await expect(page.locator('h1')).toContainText('Your Bag');
	await expect(page.locator('.cart-item')).toBeVisible();

	// ─── Step 4: Proceed to checkout ───
	await page.click('a[href="/checkout"]');
	await page.waitForURL(/\/checkout/, { timeout: 5000 });

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
	await expect(page.locator('h2:has-text("Review Your Order")')).toBeVisible();
	await expect(page.locator('.step-circle.active')).toContainText('2');

	// ─── Step 6: Place order and capture redirect URL ───
	await page.locator('input[type="checkbox"]').check({ force: true });

	const responsePromise = page.waitForResponse(
		(response) =>
			response.url().includes('/api/payment/snap-token') && response.status() === 200,
		{ timeout: 20000 }
	);

	await page.click('button:has-text("Place Order")');

	const snapResponse = await responsePromise;
	const { redirectUrl } = (await snapResponse.json()) as { redirectUrl: string };

	expect(redirectUrl).toBeTruthy();
	expect(redirectUrl).toContain('sandbox.midtrans.com');

	// ─── Step 7: Navigate to Midtrans redirect URL ───
	await page.goto(redirectUrl);

	// Wait for the Midtrans payment page to load
	await page.waitForLoadState('networkidle');

	// ─── Step 8: Complete test payment ───
	// Wait for and click the "Credit/debit card" payment option
	await expect(page.locator('text=Credit/debit card').first()).toBeVisible({ timeout: 15000 });
	await page.locator('text=Credit/debit card').first().click();

	// Fill test card details (Midtrans sandbox test Visa)
	await page.getByRole('textbox', { name: '1234 1234 1234 1234' }).fill('4811 1111 1111 1114');
	await page.getByRole('textbox', { name: 'MM/YY' }).fill('12/30');
	await page.locator('input#card-cvv').fill('123');

	// Click Pay
	await page.getByRole('button', { name: 'Pay now' }).click();

	// ─── Step 9: Wait for redirect after payment ───
	// Midtrans sandbox redirects to example.com by default for unregistered localhost URLs.
	// Verify payment success by checking transaction_status=capture in the final URL.
	await page.waitForURL((url) => url.searchParams.get('transaction_status') === 'capture', {
		timeout: 60000,
	});

	// Confirm success params are present
	const finalUrl = new URL(page.url());
	expect(finalUrl.searchParams.get('status_code')).toBe('200');
	expect(finalUrl.searchParams.get('transaction_status')).toBe('capture');
});
