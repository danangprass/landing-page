import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		const userId = String(locals.user.id);
		const items = await locals.pb.collection('cart_items').getFullList({
			expand: 'product',
			filter: `user = '${userId.replace(/'/g, "''")}'`,
		});
		return json(items);
	} catch (err) {
		console.error('[API /cart GET]', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to load cart');
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
	} catch (err) {
		console.error('[API /cart POST]', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to add item');
	}
};

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		const userId = String(locals.user.id);
		const items = await locals.pb.collection('cart_items').getFullList({
			filter: `user = '${userId.replace(/'/g, "''")}'`,
		});
		await Promise.all(items.map((i) => locals.pb.collection('cart_items').delete(i.id)));
		return json({ success: true, deleted: items.length });
	} catch (err) {
		console.error('[API /cart DELETE]', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to clear cart');
	}
};
