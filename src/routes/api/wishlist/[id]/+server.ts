import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	try {
		await locals.pb.collection('wishlists').delete(params.id);
		return json({ success: true });
	} catch {
		throw error(500, 'Failed to remove item');
	}
};
