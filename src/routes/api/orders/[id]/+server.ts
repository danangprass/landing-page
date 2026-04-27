import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED_STATUSES = ['pending', 'paid', 'failed', 'cancelled'] as const;

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const data = await request.json().catch(() => null);
	if (!data || typeof data.status !== 'string') {
		throw error(400, 'status is required');
	}
	if (!ALLOWED_STATUSES.includes(data.status as (typeof ALLOWED_STATUSES)[number])) {
		throw error(400, 'Invalid status value');
	}

	try {
		const order = await locals.pb.collection('orders').getOne(params.id);
		if (order.user !== locals.user.id) throw error(403, 'Forbidden');
		await locals.pb.collection('orders').update(params.id, { status: data.status });
		return json({ success: true });
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number') throw e;
		throw error(500, 'Failed to update order');
	}
};
