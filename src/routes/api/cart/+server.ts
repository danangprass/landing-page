import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		const userId = String(locals.user.id);
		const items = await locals.pb.collection('cart_items').getFullList({
			expand: 'product',
			sort: '-created',
			filter: `user = '${userId.replace(/'/g, "''")}'`,
		});
		return json(items);
	} catch {
		throw error(500, 'Failed to load cart');
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const data = await request.json();

	if (!data.product || typeof data.product !== 'string') {
		throw error(400, 'Invalid product ID');
	}
	if (!data.quantity || typeof data.quantity !== 'number' || data.quantity < 1) {
		throw error(400, 'Invalid quantity');
	}

	try {
		const item = await locals.pb.collection('cart_items').create({
			user: String(locals.user.id),
			product: data.product,
			quantity: data.quantity,
		});
		return json(item);
	} catch {
		throw error(500, 'Failed to add item');
	}
};
