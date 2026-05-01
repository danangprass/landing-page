import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const page = await locals.pb.collection('pages').getFirstListItem(
			locals.pb.filter('slug = {:slug}', { slug: params.slug }),
		);

		return {
			page: {
				id: page.id,
				title: (page as Record<string, unknown>).title as string ?? '',
				slug: (page as Record<string, unknown>).slug as string ?? '',
				content: (page as Record<string, unknown>).content as string ?? '',
			},
		};
	} catch {
		throw error(404, 'Page not found');
	}
};
