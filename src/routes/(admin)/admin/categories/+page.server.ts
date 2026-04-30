import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const categories = await locals.pb.collection('categories').getFullList({
		sort: 'sort_order,name',
	});

	return {
		categories: categories.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			description: c.description,
			active: c.active ?? false,
			sort_order: c.sort_order ?? 0,
			image: c.image,
			imageUrl: c.image ? locals.pb.files.getUrl(c, c.image) : '',
		})),
	};
};

export const actions: Actions = {
	toggleActive: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const active = data.get('active') === 'true';

		if (!id) return fail(400, { error: 'Missing category ID' });

		try {
			await locals.pb.collection('categories').update(id, { active: !active });
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to update category';
			return fail(400, { error: message });
		}
		throw redirect(303, '/admin/categories');
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing category ID' });

		await locals.pb.collection('categories').delete(id);
		throw redirect(303, '/admin/categories');
	},
};
