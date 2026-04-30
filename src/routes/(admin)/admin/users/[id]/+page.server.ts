import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const user = await locals.pb.collection('users').getOne(params.id);

		const orders = await locals.pb.collection('orders').getList(1, 20, {
			filter: `user = "${params.id.replace(/"/g, '\\"')}"`,
		});

		return {
			user: {
				id: user.id,
				name: user.name ?? '-',
				email: user.email,
				verified: user.verified ?? false,
				role: (user as Record<string, unknown>).role ?? 'customer',
				created: user.created,
				avatar: user.avatar,
				avatarUrl: user.avatar ? locals.pb.files.getUrl(user, user.avatar) : '',
			},
			orders: orders.items.map((o) => ({
				id: o.id,
				total: o.total,
				status: o.status,
				order_status: o.status,
				created: '-',
			})),
			totalOrders: orders.totalItems,
			isSuperuser: locals.isSuperuser ?? false,
		};
	} catch {
		throw error(404, 'User not found');
	}
};

export const actions: Actions = {
	toggleRole: async ({ request, params, locals }) => {
		if (params.id === locals.user?.id) {
			return fail(403, { error: 'Cannot modify your own role' });
		}

		const data = await request.formData();
		const currentRole = data.get('role') as string;
		const newRole = currentRole === 'admin' ? 'customer' : 'admin';

		try {
			await locals.pb.collection('users').update(params.id, { role: newRole });
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to update role';
			return fail(400, { error: message });
		}
		throw redirect(303, `/admin/users/${params.id}`);
	},

	toggleVerified: async ({ request, params, locals }) => {
		const data = await request.formData();
		const currentVerified = data.get('verified') === 'true';

		try {
			await locals.pb.collection('users').update(params.id, { verified: !currentVerified });
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to update verified status';
			return fail(400, { error: message });
		}
		throw redirect(303, `/admin/users/${params.id}`);
	},

	delete: async ({ request, params, locals }) => {
		const data = await request.formData();
		const role = data.get('role') as string;

		// Only _superusers can delete admin users
		if (role === 'admin') {
			if (!locals.isSuperuser) {
				return fail(403, { error: 'Only superusers can delete admin accounts. Admin users cannot delete other admins.' });
			}
		}

		try {
			await locals.pb.collection('users').delete(params.id);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete user';
			return fail(400, { error: message });
		}
		throw redirect(303, '/admin/users');
	},
};
