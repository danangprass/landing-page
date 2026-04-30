import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const order = await locals.pb.collection('orders').getOne(params.id, {
			expand: 'user',
		});

		const items = await locals.pb.collection('order_items').getFullList({
			filter: `order = "${params.id.replace(/"/g, '\\"')}"`,
			expand: 'product',
		});

		return {
			order: {
				id: order.id,
				total: order.total,
				status: order.status,
				shipping_address: order.shipping_address ?? '-',
				billing_address: order.billing_address ?? '-',
				created: '-',
				updated: order.updated,
				userName: (order.expand?.user as { name?: string })?.name ?? 'Unknown',
				userEmail: (order.expand?.user as { email?: string })?.email ?? 'Unknown',
			},
			items: items.map((i) => ({
				id: i.id,
				productName: (i.expand?.product as { name?: string })?.name ?? 'Unknown',
				price: i.price,
				quantity: i.quantity,
			})),
		};
	} catch {
		throw error(404, 'Order not found');
	}
};

export const actions: Actions = {
	updateStatus: async ({ request, params, locals }) => {
		const data = await request.formData();
		const status = data.get('status') as string;

		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

		const update: Record<string, string> = {};
		if (status && validStatuses.includes(status)) update.status = status;

		await locals.pb.collection('orders').update(params.id, update);
		throw redirect(303, `/admin/orders/${params.id}`);
	},
};
