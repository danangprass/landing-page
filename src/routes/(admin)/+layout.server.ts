import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user as Record<string, unknown> | null;

	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	if (user.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			avatar: user.avatar,
		},
	};
};
