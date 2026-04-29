import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const cat = await locals.pb.collection('categories').getOne(params.id);
		return {
			category: {
				id: cat.id,
				name: cat.name,
				slug: cat.slug,
				description: cat.description ?? '',
				active: cat.active ?? false,
				sort_order: cat.sort_order ?? 0,
				image: cat.image,
				imageUrl: cat.image ? locals.pb.files.getUrl(cat, cat.image) : '',
			},
		};
	} catch {
		throw error(404, 'Category not found');
	}
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();

		if (!name || !slug) {
			return fail(400, { error: 'Name and slug are required.' });
		}

		const description = (data.get('description') as string)?.trim() || undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : undefined;
		const active = data.get('active') === 'on';

		const image = (data.get('image') as File | null);
		const updateData: Record<string, unknown> = {
			name,
			slug,
			description,
			sort_order: sortOrder,
			active,
		};

		if (image && image.size > 0) {
			updateData.image = image;
		}

		await locals.pb.collection('categories').update(params.id, updateData);

		throw redirect(303, '/admin/categories');
	},
};
