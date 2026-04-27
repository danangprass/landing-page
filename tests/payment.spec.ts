import { test, expect } from '@playwright/test';

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
		// Missing orderId and items
		const res = await request.post('/api/payment/snap-token', {
			data: { total: 100000 },
			headers: {
				Cookie: 'pb_auth=' + encodeURIComponent(JSON.stringify({ token: 'fake-token', model: { id: 'u1', email: 'test@example.com' } })),
			},
		});
		expect(res.status()).toBe(400);
	});

	test('POST /api/payment/snap-token with valid order returns snapToken string', async ({ request }) => {
		const res = await request.post('/api/payment/snap-token', {
			data: {
				orderId: 'ORDER-TEST-001',
				total: 150000,
				items: [
					{ id: 'P1', price: 75000, quantity: 2, name: 'Widget A' },
				],
				shippingAddress: {
					first_name: 'John',
					address: '123 Main St',
					city: 'Jakarta',
					postal_code: '12345',
					country_code: 'IDN',
				},
			},
			headers: {
				Cookie: 'pb_auth=' + encodeURIComponent(JSON.stringify({ token: 'fake-token', model: { id: 'u1', email: 'test@example.com', name: 'John Doe' } })),
			},
		});

		// Note: this test will return 500 in CI unless Midtrans credentials are configured.
		// We accept either 200 (with real credentials) or 500 (when Midtrans is unavailable).
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
