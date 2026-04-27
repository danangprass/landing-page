import { env } from '$env/dynamic/private';

const SNAP_API_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

interface SnapItem {
	id: string;
	price: number;
	quantity: number;
	name: string;
}

interface SnapCustomer {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	shipping_address?: Record<string, unknown>;
}

export interface SnapOrder {
	orderId: string;
	grossAmount: number;
	items: SnapItem[];
	customerDetails: SnapCustomer;
}

export async function createSnapToken(order: SnapOrder): Promise<{ snapToken: string; redirectUrl: string }> {
	const serverKey = env.SERVER_KEY ?? env.MIDTRANS_SERVER_KEY;
	if (!serverKey) {
		throw new Error('SERVER_KEY is not configured');
	}

	const auth = Buffer.from(`${serverKey}:`).toString('base64');

	const response = await fetch(SNAP_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Basic ${auth}`,
		},
		body: JSON.stringify({
			transaction_details: {
				order_id: order.orderId,
				gross_amount: order.grossAmount,
			},
			item_details: order.items,
			customer_details: order.customerDetails,
		}),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Midtrans API error: ${response.status} ${errorBody}`);
	}

	const data = (await response.json()) as { token: string; redirect_url: string };

	return {
		snapToken: data.token,
		redirectUrl: data.redirect_url,
	};
}
