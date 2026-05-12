import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : undefined;
		const active = data.get('active') === 'on';

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required.',
				values: { name, slug, description, sort_order: sortOrder, active },
			});
		}

		const image = (data.get('image') as File | null);
		const createData: Record<string, unknown> = {
			name,
			slug,
			active,
		};
		if (description !== undefined) createData.description = description;
		if (sortOrder !== undefined) createData.sort_order = sortOrder;

		if (image && image.size > 0) {
			createData.image = image;
		}

		await locals.pb.collection('categories').create(createData);

		throw redirect(303, '/admin/categories');
	},
};
