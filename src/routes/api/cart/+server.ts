import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		const items = await locals.pb.collection('cart_items').getFullList({
			expand: 'product',
			sort: '-created',
			filter: `user = "${locals.user.id}"`,
		});
		return json(items);
	} catch {
		throw error(500, 'Failed to load cart');
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const data = await request.json();
	try {
		const item = await locals.pb.collection('cart_items').create({
			user: locals.user.id,
			product: data.product,
			quantity: data.quantity,
		});
		return json(item);
	} catch {
		throw error(500, 'Failed to add item');
	}
};
