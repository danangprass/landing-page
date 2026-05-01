import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

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
		sort: 'name',
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
		isSuperuser: locals.isSuperuser ?? false,
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing user ID' });

		// Fetch the user from DB to get the server-authoritative role.
		// Using form-data role would allow attackers to bypass the check.
		const target = await locals.pb.collection('users').getOne(id);
		const actualRole = (target as Record<string, unknown>).role ?? 'customer';

		if (actualRole === 'admin' && !locals.isSuperuser) {
			return fail(403, { error: 'Only superusers can delete admin accounts.' });
		}

		await locals.pb.collection('users').delete(id);
		throw redirect(303, '/admin/users');
	},
};
