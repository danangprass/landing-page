import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const statusFilter = url.searchParams.get('status') ?? '';

	const filterParts: string[] = [];
	if (statusFilter) {
		filterParts.push(`status = "${statusFilter}"`);
	}
	const filter = filterParts.length > 0 ? filterParts.join(' && ') : '';

	const result = await pb.collection('orders').getList(1, 50, {
		expand: 'user',
		filter,
		fields: 'id,total,status,created,user',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	return {
		orders: result.items.map((o) => ({
			id: o.id as string,
			total: o.total as number,
			status: o.status as string,
			created: (o.created as string) ?? '-',
			userName: (o.expand?.user as { name?: string })?.name ?? 'Unknown',
		})),
		currentStatus: statusFilter,
	};
};
