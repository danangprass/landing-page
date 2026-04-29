import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const user = await locals.pb.collection('users').getOne(params.id);

		const orders = await locals.pb.collection('orders').getList(1, 20, {
			sort: '-created',
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
				order_status: o.order_status,
				created: o.created,
			})),
			totalOrders: orders.totalItems,
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

		await locals.pb.collection('users').update(params.id, { role: newRole });
		throw redirect(303, `/admin/users/${params.id}`);
	},

	toggleVerified: async ({ request, params, locals }) => {
		const data = await request.formData();
		const currentVerified = data.get('verified') === 'true';

		await locals.pb.collection('users').update(params.id, { verified: !currentVerified });
		throw redirect(303, `/admin/users/${params.id}`);
	},
};
