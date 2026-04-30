import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const pb = locals.pb;
	const user = locals.user as { id: string } | null;

	if (!user?.id) {
		throw error(401, 'Not authenticated');
	}

	const order = await pb
		.collection('orders')
		.getOne(params.id, { $autoCancel: false })
		.catch(() => null);

	if (!order) {
		throw error(404, 'Order not found');
	}

	// Verify ownership
	if ((order as Record<string, unknown>).user !== user.id) {
		throw error(403, 'Not authorized');
	}

	const items = await pb
		.collection('order_items')
		.getList(1, 100, {
			filter: `order = "${order.id}"`,
			expand: 'product',
			$autoCancel: false,
		})
		.catch(() => ({ items: [] }));

	const lineItems = items.items.map((i) => ({
		id: i.id,
		name: (i.expand?.product as { name?: string })?.name ?? 'Unknown',
		image: (i.expand?.product as { images?: string[] })?.images?.[0] ?? null,
		slug: (i.expand?.product as { slug?: string })?.slug ?? '',
		price: i.price ?? 0,
		quantity: i.quantity ?? 1,
	}));

	const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

	return {
		order: {
			id: order.id,
			total: (order as Record<string, unknown>).total ?? subtotal,
			status: (order as Record<string, unknown>).status ?? 'pending',
			created: (order as Record<string, unknown>).created ?? '',
			shippingAddress: (order as Record<string, unknown>).shipping_address ?? {},
		},
		lineItems,
	};
};
