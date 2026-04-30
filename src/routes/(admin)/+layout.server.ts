import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user as Record<string, unknown> | null;

	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	// PocketBase _superusers are always considered admins
	if (locals.isSuperuser) {
		return {
			user: {
				id: user.id,
				email: user.email,
				name: (user as Record<string, unknown>).name ?? 'Superuser',
				role: 'admin',
				avatar: (user as Record<string, unknown>).avatar,
				isSuperuser: true,
			},
		};
	}

	// Fetch the full user record to get the role field.
	// The auth cookie model may not include custom fields added after the user
	// originally logged in (e.g. the `role` field).
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
