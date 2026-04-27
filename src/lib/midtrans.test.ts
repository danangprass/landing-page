import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSnapToken } from './midtrans';

vi.mock('$env/dynamic/private', () => ({
	env: {
		SERVER_KEY: 'test-server-key',
		MIDTRANS_SERVER_KEY: 'fallback-server-key',
	},
}));

describe('createSnapToken', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('constructs correct request body with server key and order details', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ token: 'snap-token-123', redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-123' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);

		await createSnapToken({
			orderId: 'ORDER-101',
			grossAmount: 150000,
			items: [
				{ id: 'PROD-1', price: 50000, quantity: 2, name: 'Widget A' },
				{ id: 'PROD-2', price: 50000, quantity: 1, name: 'Widget B' },
			],
			customerDetails: {
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
			},
		});

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0];
		expect(url).toBe('https://app.sandbox.midtrans.com/snap/v1/transactions');
		expect(init?.method).toBe('POST');

		const headers = init?.headers as Record<string, string>;
		expect(headers['Content-Type']).toBe('application/json');
		expect(headers['Accept']).toBe('application/json');
		expect(headers['Authorization']).toBe(`Basic ${Buffer.from('test-server-key:').toString('base64')}`);

		const body = JSON.parse(init?.body as string);
		expect(body.transaction_details).toEqual({
			order_id: 'ORDER-101',
			gross_amount: 150000,
		});
		expect(body.item_details).toEqual([
			{ id: 'PROD-1', price: 50000, quantity: 2, name: 'Widget A' },
			{ id: 'PROD-2', price: 50000, quantity: 1, name: 'Widget B' },
		]);
		expect(body.customer_details).toEqual({
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
		});
	});

	it('returns snapToken and redirectUrl on 200 response', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ token: 'snap-token-abc', redirect_url: 'https://redirect.url' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);

		const result = await createSnapToken({
			orderId: 'ORDER-102',
			grossAmount: 100000,
			items: [{ id: 'P1', price: 100000, quantity: 1, name: 'Gadget' }],
			customerDetails: { email: 'test@example.com' },
		});

		expect(result.snapToken).toBe('snap-token-abc');
		expect(result.redirectUrl).toBe('https://redirect.url');
	});

	it('throws on non-200 response', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ error_messages: ['Invalid amount'] }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		);

		await expect(
			createSnapToken({
				orderId: 'ORDER-103',
				grossAmount: 0,
				items: [],
				customerDetails: {},
			})
		).rejects.toThrow('Midtrans API error: 400');
	});

	it('throws when SERVER_KEY is not configured', async () => {
		const { env } = await import('$env/dynamic/private');
		// biome-ignore lint/performance/noDelete: test-only mutation
		delete (env as Record<string, string>).SERVER_KEY;
		// biome-ignore lint/performance/noDelete: test-only mutation
		delete (env as Record<string, string>).MIDTRANS_SERVER_KEY;

		await expect(
			createSnapToken({
				orderId: 'ORDER-104',
				grossAmount: 100000,
				items: [{ id: 'P1', price: 100000, quantity: 1, name: 'Gadget' }],
				customerDetails: {},
			})
		).rejects.toThrow('SERVER_KEY is not configured');
	});
});
