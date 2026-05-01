import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (params.id === 'new') {
		return { page: null };
	}

	try {
		const record = await locals.pb.collection('pages').getOne(params.id);
		return {
			page: {
				id: record.id,
				title: (record as Record<string, unknown>).title as string ?? '',
				slug: (record as Record<string, unknown>).slug as string ?? '',
				content: (record as Record<string, unknown>).content as string ?? '',
			},
		};
	} catch {
		throw error(404, 'Page not found');
	}
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const data = await request.formData();

		const title = (data.get('title') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();
		const content = (data.get('content') as string)?.trim() ?? '';

		if (!title || !slug) {
			return fail(400, { error: 'Title and slug are required.' });
		}

		if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
			return fail(400, { error: 'Slug can only contain lowercase letters, numbers, and hyphens.' });
		}

		const recordData: Record<string, unknown> = { title, slug, content };

		try {
			if (params.id === 'new') {
				await locals.pb.collection('pages').create(recordData);
			} else {
				await locals.pb.collection('pages').update(params.id, recordData);
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to save page';
			return fail(400, { error: message });
		}

		throw redirect(303, '/admin/pages');
	},
};
