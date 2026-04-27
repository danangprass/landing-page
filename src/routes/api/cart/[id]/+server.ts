import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		await locals.pb.collection('cart_items').delete(params.id);
		return json({ success: true });
	} catch {
		throw error(500, 'Failed to remove item');
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const data = await request.json();
	try {
		const item = await locals.pb.collection('cart_items').update(params.id, { quantity: data.quantity });
		return json(item);
	} catch {
		throw error(500, 'Failed to update item');
	}
};
