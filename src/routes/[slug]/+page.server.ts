import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const slug = params.slug;

	try {
		const records = await locals.pb.collection('pages').getFullList({
			filter: locals.pb.filter('slug = {:slug}', { slug }),
		});

		if (records.length === 0) {
			throw error(404, 'Page not found');
		}

		const page = records[0];
		return {
			page: {
				id: page.id,
				title: (page as Record<string, unknown>).title as string ?? '',
				slug: (page as Record<string, unknown>).slug as string ?? '',
				content: (page as Record<string, unknown>).content as string ?? '',
			},
		};
	} catch (e) {
		if ((e as { status?: number }).status === 404) throw e;
		throw error(404, 'Page not found');
	}
};
