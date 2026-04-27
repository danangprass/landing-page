import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const data = await request.json();
	let orderId: string | null = null;
	try {
		const order = await locals.pb.collection('orders').create({
			user: locals.user.id,
			status: 'pending',
			order_status: 'pending',
			total: data.total,
			shipping_address: data.shipping_address,
			billing_address: data.billing_address,
			...(data.midtrans_transaction_id ? { midtrans_transaction_id: data.midtrans_transaction_id } : {}),
		});
		orderId = order.id;
		await Promise.all(
			data.items.map((item: { product: string; quantity: number; price: number }) =>
				locals.pb.collection('order_items').create({
					order: order.id,
					product: item.product,
					quantity: item.quantity,
					price: item.price,
				})
			)
		);
		return json({ success: true, orderId: order.id });
	} catch {
		if (orderId) {
			try { await locals.pb.collection('orders').delete(orderId); } catch { /* best-effort rollback */ }
		}
		throw error(500, 'Failed to place order');
	}
};
