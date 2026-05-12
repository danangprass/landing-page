import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const result = await pb.collection('products').getList(1, 50, {
		sort: 'name',
		expand: 'category',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	return {
		products: result.items.map((p) => ({
			id: p.id as string,
			slug: p.slug as string,
			name: p.name as string,
			price: p.price as number,
			stock: p.stock as number,
			featured: p.featured as boolean,
			active: p.active as boolean,
			categoryName: (p.expand?.category as { name?: string })?.name ?? '-',
		})),
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing product ID' });

		await locals.pb.collection('products').delete(id);
		throw redirect(303, '/admin/products');
	},
};
