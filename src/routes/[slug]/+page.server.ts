import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { staticPagesBySlug } from '$lib/data/static-pages';

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
		// Fallback to static content for known pages
		const staticPage = staticPagesBySlug.get(params.slug);
		if (staticPage) {
			return {
				page: {
					id: 'static-' + staticPage.slug,
					title: staticPage.title,
					slug: staticPage.slug,
					content: staticPage.content,
				},
			};
		}
		throw error(404, 'Page not found');
	}
};
