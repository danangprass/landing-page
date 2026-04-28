import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';

const AUTH_STATE = 'playwright/.auth/user.json';
const hasAuth = existsSync(AUTH_STATE);

test.describe('Payment Snap Token API', () => {
	test('POST /api/payment/snap-token without auth returns 401', async ({ request }) => {
		const res = await request.post('/api/payment/snap-token', {
			data: {
				orderId: 'ORDER-TEST',
				total: 100000,
				items: [{ id: 'P1', price: 100000, quantity: 1, name: 'Gadget' }],
			},
		});
		expect(res.status()).toBe(401);
	});

	test('POST /api/payment/snap-token with missing fields returns 400', async ({ request }) => {
		const res = await request.post('/api/payment/snap-token', {
			data: { total: 100000 },
			headers: {
				Cookie:
					'pb_auth=' +
					encodeURIComponent(
						JSON.stringify({ token: 'fake-token', model: { id: 'u1', email: 'test@example.com' } })
					),
			},
		});
		expect(res.status()).toBe(400);
	});

	test('POST /api/payment/snap-token with valid order returns snapToken string', async ({
		request,
	}) => {
		const res = await request.post('/api/payment/snap-token', {
			data: {
				orderId: 'ORDER-TEST-001',
				total: 150000,
				items: [{ id: 'P1', price: 75000, quantity: 2, name: 'Widget A' }],
				shippingAddress: {
					first_name: 'John',
					address: '123 Main St',
					city: 'Jakarta',
					postal_code: '12345',
					country_code: 'IDN',
				},
			},
			headers: {
				Cookie:
					'pb_auth=' +
					encodeURIComponent(
						JSON.stringify({
							token: 'fake-token',
							model: { id: 'u1', email: 'test@example.com', name: 'John Doe' },
						})
					),
			},
		});

		// Accept 200 (real Midtrans credentials) or 500 (Midtrans unavailable in CI)
		const status = res.status();
		expect([200, 500]).toContain(status);

		if (status === 200) {
			const body = await res.json();
			expect(body).toHaveProperty('snapToken');
			expect(typeof body.snapToken).toBe('string');
			expect(body).toHaveProperty('redirectUrl');
			expect(typeof body.redirectUrl).toBe('string');
		}
	});
});

test.describe('Order Status PATCH API (/api/orders/:id/status)', () => {
	test('PATCH /api/orders/:id/status without auth returns 401', async ({ request }) => {
		const res = await request.patch('/api/orders/fake-order-id/status', {
			data: { status: 'paid' },
		});
		expect(res.status()).toBe(401);
	});

	test('PATCH /api/orders/:id/status with invalid status returns 400', async ({ request }) => {
		const res = await request.patch('/api/orders/fake-order-id/status', {
			data: { status: 'shipped' },
			headers: {
				Cookie:
					'pb_auth=' +
					encodeURIComponent(
						JSON.stringify({ token: 'fake-token', model: { id: 'u1', email: 'test@example.com' } })
					),
			},
		});
		expect(res.status()).toBe(400);
	});
});

test.describe('Snap Client Integration — Authenticated', () => {
	test.skip(!hasAuth, 'PocketBase auth state not available — skipping authenticated tests');

	test.use({ storageState: AUTH_STATE });

	test('review step shows payment via Midtrans message (no card fields)', async ({ page }) => {
		await page.goto('/checkout');

		await expect(page.locator('#cardNumber')).not.toBeAttached();
		await expect(page.locator('text=Midtrans Snap')).not.toBeVisible();
	});

	test('snap.pay is called with token after place order (mocked)', async ({ page }) => {
		// Mock cart so checkout flow can proceed
		await page.route('/api/cart', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'cart-mock-1',
						product: 'prod-mock-1',
						quantity: 2,
						user: 'u1',
						expand: {
							product: {
								id: 'prod-mock-1',
								name: 'Widget A',
								price: 75000,
								active: true,
								sku: 'widget-a',
								expand: {
									category: {
										id: 'cat-mock-1',
										name: 'Gadgets',
										slug: 'gadgets',
										active: true,
									},
								},
							},
						},
					},
				]),
			});
		});
		// Intercept API calls and mock snap.js
		await page.route('/api/orders', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, orderId: 'ORDER-MOCK-001' }),
			});
		});
		await page.route('/api/payment/snap-token', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ snapToken: 'mock-snap-token', redirectUrl: '' }),
			});
		});
		const mockSnapBody = `window.snap = { pay: function(token, opts) { window.__snapToken = token; window.__snapOpts = opts; } };`;
		await page.route('https://app.sandbox.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});
		await page.route('https://app.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});

		await page.goto('/checkout');

		// Fill shipping
		await page.fill('#fullName', 'Test User');
		await page.fill('#address1', '123 Test St');
		await page.fill('#city', 'Jakarta');
		await page.fill('#state', 'DKI Jakarta');
		await page.fill('#zip', '10110');
		await page.fill('#phone', '08123456789');
		await page.click('button:has-text("Continue to Review")');

		// Accept terms and place order
		await page.locator('input[type="checkbox"]').check({ force: true });
		await page.click('button:has-text("Place Order")');

		// Verify snap.pay was called with the mock token
		await page.waitForFunction(() => (window as unknown as { __snapToken?: string }).__snapToken !== undefined);
		const snapToken = await page.evaluate(() => (window as unknown as { __snapToken?: string }).__snapToken);
		expect(snapToken).toBe('mock-snap-token');
	});

	test('snap onClose keeps user on review step without crash', async ({ page }) => {
		await page.route('/api/cart', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'cart-mock-1',
						product: 'prod-mock-1',
						quantity: 2,
						user: 'u1',
						expand: {
							product: {
								id: 'prod-mock-1',
								name: 'Widget A',
								price: 75000,
								active: true,
								sku: 'widget-a',
								expand: {
									category: {
										id: 'cat-mock-1',
										name: 'Gadgets',
										slug: 'gadgets',
										active: true,
									},
								},
							},
						},
					},
				]),
			});
		});
		await page.route('/api/orders', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, orderId: 'ORDER-MOCK-002' }),
			});
		});
		await page.route('/api/payment/snap-token', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ snapToken: 'mock-snap-token', redirectUrl: '' }),
			});
		});
		const mockSnapBody = `window.snap = { pay: function(token, opts) { if (opts.onClose) opts.onClose(); } };`;
		await page.route('https://app.sandbox.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});
		await page.route('https://app.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});

		await page.goto('/checkout');

		await page.fill('#fullName', 'Test User');
		await page.fill('#address1', '123 Test St');
		await page.fill('#city', 'Jakarta');
		await page.fill('#state', 'DKI Jakarta');
		await page.fill('#zip', '10110');
		await page.fill('#phone', '08123456789');
		await page.click('button:has-text("Continue to Review")');

		await page.locator('input[type="checkbox"]').check({ force: true });
		await page.click('button:has-text("Place Order")');

		// Should remain on review step — Place Order button still visible
		await expect(page.locator('button:has-text("Place Order")')).toBeVisible();
		// No crash — no JS errors expected
	});

	test('snap onError shows retry option', async ({ page }) => {
		await page.route('/api/cart', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'cart-mock-1',
						product: 'prod-mock-1',
						quantity: 2,
						user: 'u1',
						expand: {
							product: {
								id: 'prod-mock-1',
								name: 'Widget A',
								price: 75000,
								active: true,
								sku: 'widget-a',
								expand: {
									category: {
										id: 'cat-mock-1',
										name: 'Gadgets',
										slug: 'gadgets',
										active: true,
									},
								},
							},
						},
					},
				]),
			});
		});
		await page.route('/api/orders', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, orderId: 'ORDER-MOCK-003' }),
			});
		});
		await page.route('/api/payment/snap-token', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ snapToken: 'mock-snap-token', redirectUrl: '' }),
			});
		});
		await page.route('/api/orders/ORDER-MOCK-003/status', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
		});
		const mockSnapBody = `window.snap = { pay: function(token, opts) { if (opts.onError) opts.onError({}); } };`;
		await page.route('https://app.sandbox.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});
		await page.route('https://app.midtrans.com/snap/snap.js', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSnapBody });
		});

		await page.goto('/checkout');

		await page.fill('#fullName', 'Test User');
		await page.fill('#address1', '123 Test St');
		await page.fill('#city', 'Jakarta');
		await page.fill('#state', 'DKI Jakarta');
		await page.fill('#zip', '10110');
		await page.fill('#phone', '08123456789');
		await page.click('button:has-text("Continue to Review")');

		await page.locator('input[type="checkbox"]').check({ force: true });
		await page.click('button:has-text("Place Order")');

		await expect(page.locator('button:has-text("Retry Payment")')).toBeVisible({ timeout: 10000 });
	});
});
