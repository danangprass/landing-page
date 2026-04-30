import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const transaction = await locals.pb.collection('transactions').getOne(params.id, {
			expand: 'user,order_id',
		});

		return {
			transaction: {
				id: transaction.id,
				order_id: transaction.order_id ?? '-',
				amount: transaction.amount,
				status: transaction.status,
				payment_method: transaction.payment_method ?? '-',
				transaction_details: transaction.transaction_details ?? null,
				created: transaction.created ?? '-',
				updated: transaction.updated ?? '-',
				userName: (transaction.expand?.user as { name?: string })?.name ?? 'Unknown',
				userEmail: (transaction.expand?.user as { email?: string })?.email ?? 'Unknown',
			},
		};
	} catch {
		throw error(404, 'Transaction not found');
	}
};
