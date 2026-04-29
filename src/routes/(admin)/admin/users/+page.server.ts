import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const page = Number(url.searchParams.get('page') ?? '1');
	const search = url.searchParams.get('search') ?? '';

	const filterParts: string[] = [];
	if (search) {
		filterParts.push(`(name ~ "${search}" || email ~ "${search}")`);
	}
	const filter = filterParts.length > 0 ? filterParts.join(' && ') : '';

	const result = await pb.collection('users').getList(page, 20, {
		sort: '-created',
		filter,
	});

	return {
		users: result.items.map((u) => ({
			id: u.id,
			name: u.name ?? '-',
			email: u.email,
			verified: u.verified ?? false,
			role: (u as Record<string, unknown>).role ?? 'customer',
			created: u.created,
		})),
		totalPages: result.totalPages,
		page,
		search,
	};
};
