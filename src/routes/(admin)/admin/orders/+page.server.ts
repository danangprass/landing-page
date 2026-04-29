import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const page = Number(url.searchParams.get('page') ?? '1');
	const statusFilter = url.searchParams.get('status') ?? '';

	const filterParts: string[] = [];
	if (statusFilter) {
		filterParts.push(`status = "${statusFilter}"`);
	}
	const filter = filterParts.length > 0 ? filterParts.join(' && ') : '';

	const result = await pb.collection('orders').getList(page, 15, {
		sort: '-created',
		expand: 'user',
		filter,
		fields: 'id,total,status,order_status,created,user',
	});

	return {
		orders: result.items.map((o) => ({
			id: o.id,
			total: o.total,
			status: o.status,
			order_status: o.order_status,
			created: o.created,
			userName: (o.expand?.user as { name?: string })?.name ?? 'Unknown',
		})),
		totalPages: result.totalPages,
		page,
		currentStatus: statusFilter,
	};
};
