import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must mock @sveltejs/kit before importing the handler
vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		const err = Object.assign(new Error(message), { status });
		throw err;
	},
	json: (data: unknown) => data,
}));

// Import handler after mocks are registered
const { PATCH } = await import('../../src/routes/api/orders/[id]/status/+server.js');

// Helper to build a minimal RequestEvent-like object
function makeEvent({
	userId = 'user-1',
	orderId = 'order-1',
	orderOwner = 'user-1',
	body = {},
	getOneFn = vi.fn(),
	updateFn = vi.fn().mockResolvedValue({}),
}: {
	userId?: string | null;
	orderId?: string;
	orderOwner?: string;
	body?: Record<string, unknown>;
	getOneFn?: ReturnType<typeof vi.fn>;
	updateFn?: ReturnType<typeof vi.fn>;
} = {}) {
	getOneFn.mockResolvedValue({ id: orderId, user: orderOwner });

	const mockCollection = { getOne: getOneFn, update: updateFn };

	return {
		params: { id: orderId },
		request: new Request(`http://localhost/api/orders/${orderId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}),
		locals: {
			user: userId ? { id: userId } : null,
			pb: { collection: vi.fn(() => mockCollection) },
		},
	};
}

describe('PATCH /api/orders/[id]/status', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 401 when user is not authenticated', async () => {
		const event = makeEvent({ userId: null, body: { status: 'paid' } });
		await expect(PATCH(event as never)).rejects.toMatchObject({ status: 401 });
	});

	it('returns 400 when status field is missing', async () => {
		const event = makeEvent({ body: {} });
		await expect(PATCH(event as never)).rejects.toMatchObject({ status: 400 });
	});

	it('returns 400 when status is not a valid payment status', async () => {
		const event = makeEvent({ body: { status: 'shipped' } });
		await expect(PATCH(event as never)).rejects.toMatchObject({ status: 400 });
	});

	it('returns 403 when user does not own the order', async () => {
		const event = makeEvent({
			userId: 'user-2',
			orderOwner: 'user-1',
			body: { status: 'paid' },
		});
		await expect(PATCH(event as never)).rejects.toMatchObject({ status: 403 });
	});

	it('updates order_status when user owns the order', async () => {
		const updateFn = vi.fn().mockResolvedValue({});
		const event = makeEvent({ body: { status: 'paid' }, updateFn });

		const result = await PATCH(event as never);
		expect(result).toMatchObject({ success: true });
		expect(updateFn).toHaveBeenCalledWith('order-1', expect.objectContaining({ order_status: 'paid' }));
	});

	it('saves midtrans_transaction_id when transactionId is provided', async () => {
		const updateFn = vi.fn().mockResolvedValue({});
		const event = makeEvent({
			body: { status: 'paid', transactionId: 'MT-TXN-001' },
			updateFn,
		});

		await PATCH(event as never);
		expect(updateFn).toHaveBeenCalledWith(
			'order-1',
			expect.objectContaining({ order_status: 'paid', midtrans_transaction_id: 'MT-TXN-001' })
		);
	});

	it('does not include midtrans_transaction_id when transactionId is absent', async () => {
		const updateFn = vi.fn().mockResolvedValue({});
		const event = makeEvent({ body: { status: 'failed' }, updateFn });

		await PATCH(event as never);
		const callArg = updateFn.mock.calls[0][1] as Record<string, unknown>;
		expect(callArg).not.toHaveProperty('midtrans_transaction_id');
	});

	it('accepts all valid payment statuses', async () => {
		for (const status of ['pending', 'paid', 'failed', 'cancelled']) {
			const updateFn = vi.fn().mockResolvedValue({});
			const event = makeEvent({ body: { status }, updateFn });
			await expect(PATCH(event as never)).resolves.toMatchObject({ success: true });
		}
	});
});
