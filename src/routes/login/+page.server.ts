import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import PocketBase from 'pocketbase';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		const pb = new PocketBase(PB_URL);

		// Try regular user auth first
		try {
			const auth = await pb.collection('users').authWithPassword(email, password);
			const payload = JSON.stringify({ token: auth.token, model: auth.record });
			cookies.set('pb_auth', encodeURIComponent(payload), {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'strict',
				maxAge: 604800,
			});
			return {
				success: true,
				user: {
					id: auth.record.id,
					email: auth.record.email,
					name: auth.record.name,
					avatar: auth.record.avatar,
				},
			};
		} catch {
			// Fallback: try _superusers auth
		}

		// Try _superusers auth
		try {
			const auth = await pb.collection('_superusers').authWithPassword(email, password);
			const payload = JSON.stringify({ token: auth.token, model: auth.record });
			cookies.set('pb_auth', encodeURIComponent(payload), {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'strict',
				maxAge: 604800,
			});
			return {
				success: true,
				user: {
					id: auth.record.id,
					email: auth.record.email,
					name: 'Superuser',
					avatar: undefined,
				},
			};
		} catch {
			return fail(400, { error: 'Invalid email or password.' });
		}
	},
};
