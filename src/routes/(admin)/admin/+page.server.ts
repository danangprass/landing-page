import type { PageServerLoad } from './$types';
import type { OrdersRecord } from '$lib/pb-types';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const [
		ordersResult,
		productsResult,
		usersResult,
		recentOrdersResult,
	] = await Promise.all([
		pb.collection('orders').getFullList<OrdersRecord>({ fields: 'total,order_status,status,created' }),
		pb.collection('products').getList(1, 1, { fields: 'id' }),
		pb.collection('users').getList(1, 1, { fields: 'id' }),
		pb.collection('orders').getList(1, 5, {
			sort: '-created',
			expand: 'user',
			fields: 'id,total,status,order_status,created,user',
		}),
	]);

	const paidOrders = ordersResult.filter((o) => o.order_status === 'paid');
	const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
	const totalOrders = ordersResult.length;
	const pendingOrders = ordersResult.filter((o) => o.status === 'pending').length;
	const totalProducts = productsResult.totalItems;
	const totalUsers = usersResult.totalItems;

	const lowStockResult = await pb.collection('products').getList(1, 1, {
		filter: 'stock < 5 && stock > 0',
		fields: 'id',
	});
	const lowStock = lowStockResult.totalItems;

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const monthlyOrders = ordersResult.filter(
		(o) => o.order_status === 'paid' && o.created >= startOfMonth
	);
	const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

	return {
		kpis: {
			totalRevenue,
			totalOrders,
			pendingOrders,
			totalProducts,
			totalUsers,
			lowStock,
			monthlyRevenue,
		},
		recentOrders: recentOrdersResult.items.map((o) => ({
			id: o.id,
			total: o.total,
			status: o.status,
			order_status: o.order_status,
			created: o.created,
			userName: (o.expand?.user as { name?: string })?.name ?? 'Unknown',
		})),
	};
};
