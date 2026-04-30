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

	const result = await pb.collection('transactions').getList(page, 15, {
		expand: 'user,order_id',
		filter,
		fields: 'id,order_id,amount,status,payment_method,created,user',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	return {
		transactions: result.items.map((t) => ({
			id: t.id,
			order_id: (t.order_id as string) ?? '-',
			amount: t.amount,
			status: t.status,
			payment_method: t.payment_method ?? '-',
			created: t.created ?? '-',
			userName: (t.expand?.user as { name?: string })?.name ?? 'Unknown',
		})),
		totalPages: result.totalPages,
		page,
		currentStatus: statusFilter,
	};
};
