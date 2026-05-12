import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const result = await pb.collection('reviews').getList(1, 50, {
		expand: 'product,user',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	return {
		reviews: result.items.map((r) => ({
			id: r.id,
			rating: r.rating,
			title: r.title ?? '',
			body: r.body ?? '',
			productName: (r.expand?.product as { name?: string })?.name ?? 'Unknown',
			userName: (r.expand?.user as { name?: string })?.name ?? 'Unknown',
			created: '-',
		})),
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing review ID' });
		await locals.pb.collection('reviews').delete(id);
		throw redirect(303, '/admin/reviews');
	},
};
