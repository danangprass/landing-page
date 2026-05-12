import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const statusFilter = url.searchParams.get('status') ?? '';

	const ALLOWED_STATUSES = new Set(['pending', 'settlement', 'shipped', 'cancelled', 'expire', 'deny', 'failure']);

	const filterParts: string[] = [];
	if (statusFilter && ALLOWED_STATUSES.has(statusFilter)) {
		filterParts.push(`status = "${statusFilter}"`);
	}
	const filter = filterParts.length > 0 ? filterParts.join(' && ') : '';

	const result = await pb.collection('transactions').getList(1, 50, {
		expand: 'user,order_id',
		filter,
		fields: 'id,order_id,amount,status,payment_method,created,user',
		$autoCancel: false,
	}).catch(() => ({ items: [], totalPages: 0 }));

	return {
		transactions: result.items.map((t) => ({
			id: t.id as string,
			order_id: (t.order_id as string) ?? '-',
			amount: t.amount as number,
			status: t.status as string,
			payment_method: (t.payment_method as string) ?? '-',
			created: (t.created as string) ?? '-',
			userName: (t.expand?.user as { name?: string })?.name ?? 'Unknown',
		})),
		currentStatus: statusFilter,
	};
};
