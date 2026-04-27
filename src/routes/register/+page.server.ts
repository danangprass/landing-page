import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import PocketBase from 'pocketbase';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

export const actions: Actions = {
	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const passwordConfirm = data.get('passwordConfirm') as string;

		const pb = new PocketBase(PB_URL);
		try {
			await pb.collection('users').create({ name, email, password, passwordConfirm });
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
		} catch (err: unknown) {
			const pbError = err as { data?: { data?: Record<string, { message?: string }> } };
			const fieldErrors = pbError.data?.data;
			if (fieldErrors) {
				const messages = Object.entries(fieldErrors)
					.map(([k, v]) => v.message)
					.filter(Boolean)
					.join(', ');
				return fail(400, { error: messages || 'Registration failed.' });
			}
			return fail(400, { error: 'Registration failed.' });
		}
	},
};
