import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const records = await locals.pb.collection('pages').getFullList({
		sort: '-updated',
	});

	return {
		pages: records.map((p) => ({
			id: p.id,
			title: (p as Record<string, unknown>).title as string ?? '',
			slug: (p as Record<string, unknown>).slug as string ?? '',
			content: (p as Record<string, unknown>).content as string ?? '',
			updated: (p as Record<string, unknown>).updated as string ?? '',
		})),
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing page ID' });

		try {
			await locals.pb.collection('pages').delete(id);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete page';
			return fail(400, { error: message });
		}
		throw redirect(303, '/admin/pages');
	},
};
