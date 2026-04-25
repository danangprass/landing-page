import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

export const handle: Handle = async ({ event, resolve }) => {
  // Create a server-side PB instance per request
  const pb = new PocketBase(PB_URL);

  // Load auth from cookie
  const authCookie = event.cookies.get('pb_auth');
  if (authCookie) {
    try {
      const { token, model } = JSON.parse(decodeURIComponent(authCookie));
      pb.authStore.save(token, model);
      // Verify the token is still valid
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh();
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

  const response = await resolve(event);

  // Persist any auth changes back to cookie
  const newCookie = event.cookies.get('pb_auth');
  const currentToken = pb.authStore.token;
  if (!newCookie && currentToken) {
    const payload = JSON.stringify({ token: currentToken, model: pb.authStore.record });
    event.cookies.set('pb_auth', encodeURIComponent(payload), {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'lax',
      maxAge: 604800,
    });
  }

  return response;
};