import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const page = Number(url.searchParams.get('page') ?? '1');

	const result = await pb.collection('products').getList(page, 10, {
		sort: 'name',
		expand: 'category',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	const categories = await pb.collection('categories').getFullList({
		sort: 'name',
		fields: 'id,name',
		$autoCancel: false,
	}).catch(() => []);

	return {
		products: result.items.map((p) => ({
			id: p.id,
			slug: p.slug,
			name: p.name,
			price: p.price,
			stock: p.stock,
			featured: p.featured,
			active: p.active,
			categoryName: (p.expand?.category as { name?: string })?.name ?? '-',
		})),
		totalPages: result.totalPages,
		page,
		categories,
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
