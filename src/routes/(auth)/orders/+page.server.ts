import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const user = locals.user as { id: string } | null;
	const page = Number(url.searchParams.get('page') ?? '1');

	if (!user?.id) {
		return { orders: [], totalPages: 0, page: 1 };
	}

	const result = await pb
		.collection('orders')
		.getList(page, 10, {
			filter: `user = "${user.id}"`,
			sort: '-created',
			$autoCancel: false,
		})
		.catch(() => ({ items: [], totalPages: 0 }));

	// Fetch items count for each order
	const orders = await Promise.all(
		result.items.map(async (o) => {
			const items = await pb
				.collection('order_items')
				.getList(1, 100, {
					filter: `order = "${o.id}"`,
					expand: 'product',
					$autoCancel: false,
				})
				.catch(() => ({ items: [], totalItems: 0 }));

			const previewItems = items.items.slice(0, 3).map((i) => ({
				name: (i.expand?.product as { name?: string })?.name ?? 'Unknown',
				image: (i.expand?.product as { images?: string[] })?.images?.[0] ?? null,
				price: i.price ?? 0,
				quantity: i.quantity ?? 1,
			}));

			return {
				id: o.id,
				total: o.total ?? 0,
				status: o.status ?? 'pending',
				created: o.created ?? '',
				itemCount: items.totalItems ?? 0,
				previewItems,
			};
		}),
	);

	return {
		orders,
		totalPages: result.totalPages,
		page,
	};
};
