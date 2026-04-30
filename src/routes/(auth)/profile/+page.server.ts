import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	return {
		user: {
			id: user.id as string,
			email: user.email as string,
			name: (user.name as string) ?? '',
			phone: (user.phone as string) ?? '',
			address: (user.address as string) ?? '',
		}
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { error: 'You must be signed in to update your profile.' });
		}

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const phone = (data.get('phone') as string)?.trim();
		const address = (data.get('address') as string)?.trim();

		const errors: Record<string, string> = {};

		if (!name || name.length < 2) {
			errors.name = 'Name must be at least 2 characters.';
		}

		if (phone && !/^[+]?[\d\s\-().]{6,20}$/.test(phone)) {
			errors.phone = 'Please enter a valid phone number.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { name, phone, address } });
		}

		const pb = new PocketBase(PB_URL);

		// Load auth from the locals pb instance so the update request is authenticated
		const token = locals.pb.authStore.token;
		if (token) {
			pb.authStore.save(token, null);
		}

		try {
			await pb.collection('users').update(user.id as string, {
				name,
				phone: phone || '',
				address: address || '',
			});

			return {
				success: true,
				message: 'Profile updated successfully.',
			};
		} catch (err: unknown) {
			const pbError = err as { data?: { data?: Record<string, { message?: string }> } };
			const fieldErrors = pbError.data?.data;
			if (fieldErrors) {
				const messages = Object.entries(fieldErrors)
					.map(([, v]) => v.message)
					.filter(Boolean)
					.join(', ');
				return fail(400, { error: messages || 'Failed to update profile.' });
			}
			return fail(500, { error: 'An unexpected error occurred. Please try again.' });
		}
	},
};
