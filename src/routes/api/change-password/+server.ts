import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const data = await request.json();

	if (!data.oldPassword || typeof data.oldPassword !== 'string' ||
		!data.newPassword || typeof data.newPassword !== 'string' ||
		!data.passwordConfirm || typeof data.passwordConfirm !== 'string') {
		throw error(400, 'All password fields are required.');
	}
	if (data.newPassword !== data.passwordConfirm) {
		throw error(400, 'New password and confirmation do not match.');
	}
	if (data.newPassword.length < 8) {
		throw error(400, 'New password must be at least 8 characters.');
	}

	try {
		await locals.pb.collection('users').update(String(locals.user.id), {
			oldPassword: data.oldPassword,
			password: data.newPassword,
			passwordConfirm: data.passwordConfirm,
		});
		return json({ success: true });
	} catch (err: unknown) {
		const pbError = err as { status?: number };
		if (pbError.status === 400) {
			throw error(400, 'Current password is incorrect or new password does not meet requirements.');
		}
		throw error(500, 'Failed to update password.');
	}
};
