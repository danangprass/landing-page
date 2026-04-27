import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSnapToken } from '$lib/midtrans';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid request body');
	}

	const { orderId, total, items, shippingAddress } = body as Record<string, unknown>;

	if (!orderId || typeof orderId !== 'string') {
		throw error(400, 'orderId is required and must be a string');
	}
	if (typeof total !== 'number' || total <= 0) {
		throw error(400, 'total must be a positive number');
	}
	if (!Array.isArray(items) || items.length === 0) {
		throw error(400, 'items must be a non-empty array');
	}

	const user = locals.user;
	const nameParts = String(user.name || '').split(' ');
	const firstName = nameParts[0] || 'User';
	const lastName = nameParts.slice(1).join(' ') || undefined;

	try {
		const result = await createSnapToken({
			orderId,
			grossAmount: total,
			items: items.map((item: unknown) => {
				if (!item || typeof item !== 'object') {
					throw error(400, 'Invalid item in items array');
				}
				const i = item as Record<string, unknown>;
				return {
					id: String(i.id ?? i.product ?? ''),
					price: Number(i.price),
					quantity: Number(i.quantity),
					name: String(i.name ?? 'Product'),
				};
			}),
			customerDetails: {
				first_name: firstName,
				last_name: lastName,
				email: String(user.email || ''),
				...(shippingAddress && typeof shippingAddress === 'object'
					? { shipping_address: shippingAddress }
					: {}),
			},
		});

		return json({ snapToken: result.snapToken, redirectUrl: result.redirectUrl });
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && typeof e.status === 'number') {
			throw e;
		}
		console.error('Midtrans error:', e);
		throw error(500, 'Failed to generate payment token');
	}
};
