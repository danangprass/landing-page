import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user as Record<string, unknown> | null;

	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	// Allow _superusers (PocketBase admin panel users) to access admin pages
	if (locals.isSuperuser) {
		return {
			user: {
				id: user.id as string,
				email: user.email as string,
				name: user.name as string,
				role: 'superuser',
				avatar: user.avatar,
			},
		};
	}

	const fullUser = await locals.pb.collection('users').getOne(user.id as string, { $autoCancel: false });
	const role = (fullUser as Record<string, unknown>).role;
	if (role !== 'admin') {
		throw redirect(303, '/');
	}

	return {
		user: {
			id: fullUser.id,
			email: fullUser.email,
			name: fullUser.name,
			role: fullUser.role,
			avatar: fullUser.avatar,
		},
	};
};
