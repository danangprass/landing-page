import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

export const handle: Handle = async ({ event, resolve }) => {
	// Create a server-side PB instance per request
	const pb = new PocketBase(PB_URL);

	// Load auth from httpOnly cookie
	const authCookie = event.cookies.get('pb_auth');
	if (authCookie) {
		try {
			const parsed = JSON.parse(decodeURIComponent(authCookie));
			if (!parsed || typeof parsed !== 'object' || typeof parsed.token !== 'string') {
				throw new Error('Invalid cookie structure');
			}
			const { token, model } = parsed;
			pb.authStore.save(token, model);
			// Verify the token is still valid
			if (pb.authStore.isValid) {
				try {
					if (pb.authStore.isSuperuser) {
						await pb.collection('_superusers').authRefresh();
					} else {
						await pb.collection('users').authRefresh();
					}
					// Persist refreshed token back to cookie immediately
					const payload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
					event.cookies.set('pb_auth', encodeURIComponent(payload), {
						path: '/',
						httpOnly: true,
						secure: !dev,
						sameSite: 'strict',
						maxAge: 604800,
					});
				} catch {
					// Token expired or invalid — clear it
					pb.authStore.clear();
					event.cookies.delete('pb_auth', { path: '/' });
				}
			}
		} catch {
			// Invalid cookie — ignore
		}
	}

	// Expose PB instance and auth state to load functions
	event.locals.pb = pb;
	event.locals.user = pb.authStore.record ?? null;
	event.locals.isSuperuser = pb.authStore.isSuperuser;

	return await resolve(event);
};
