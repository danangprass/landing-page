import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

const PB_URL = env.PB_URL ?? 'http://localhost:8090';

const TERMINAL_STATUSES = new Set(['shipped', 'delivered', 'cancelled']);

const ORDER_ID_RE = /^[a-z0-9]{15}$/;

function verifySignature(
	orderId: string,
	statusCode: string,
	grossAmount: string,
	signatureKey: string,
): boolean {
	const serverKey = env.SERVER_KEY ?? env.MIDTRANS_SERVER_KEY;
	if (!serverKey) return false;
	const hash = crypto
		.createHash('sha512')
		.update(orderId + statusCode + grossAmount + serverKey)
		.digest('hex');
	return hash === signatureKey;
}

/**
 * Maps a Midtrans transaction_status (and optional fraud_status) to a target
 * order status + order_status pair.  Returns null when no transition should
 * happen (e.g. a "pending" callback that keeps the order in "pending").
 */
function mapMidtransStatus(
	transactionStatus: string,
	fraudStatus?: string,
): { status: string; orderStatus: string } | null {
	switch (transactionStatus) {
		case 'capture': {
			// Credit-card capture — fraud check required
			if (fraudStatus === 'challenge') {
				// Needs manual review; leave as-is
				return null;
			}
			if (fraudStatus === 'deny') {
				return { status: 'cancelled', orderStatus: 'cancelled' };
			}
			// fraud_status 'accept' or absent
			return { status: 'shipped', orderStatus: 'paid' };
		}
		case 'settlement':
			return { status: 'shipped', orderStatus: 'paid' };
		case 'pending':
			return null; // No transition — customer hasn't completed payment
		case 'deny':
		case 'cancel':
			return { status: 'cancelled', orderStatus: 'cancelled' };
		case 'expire':
		case 'failure':
			return { status: 'cancelled', orderStatus: 'failed' };
		default:
			return null;
	}
}

/**
 * Acquires a PocketBase client authenticated as admin when credentials are
 * available.  Falls back to an unauthenticated client (some PocketBase setups
 * may allow collection-level access via API rules).
 */
async function getAdminClient(): Promise<PocketBase> {
	const pb = new PocketBase(PB_URL);

	const adminEmail = env.PB_ADMIN_EMAIL;
	const adminPassword = env.PB_ADMIN_PASSWORD;

	if (adminEmail && adminPassword) {
		try {
			// PocketBase >= 0.22 uses the _superusers collection for admin auth
			await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
		} catch {
			// Admin auth failed — proceed without auth (API rules may still allow the write)
			console.warn('[Midtrans Callback] Admin authentication failed');
		}
	}

	return pb;
}

export const POST: RequestHandler = async ({ request }) => {
	// ── Parse and validate the callback payload ─────────────────────────
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
	}

	const orderId = body.order_id as string | undefined;
	const transactionStatus = body.transaction_status as string | undefined;
	const fraudStatus = body.fraud_status as string | undefined;
	const transactionId = body.transaction_id as string | undefined;

	if (!orderId || !transactionStatus) {
		return json(
			{ success: false, message: 'Missing order_id or transaction_status' },
			{ status: 400 },
		);
	}

	if (!ORDER_ID_RE.test(orderId)) {
		return json({ success: false, message: 'Invalid order_id format' }, { status: 400 });
	}

	// ── Verify Midtrans signature ───────────────────────────────────────
	const statusCode = body.status_code as string | undefined;
	const grossAmount = body.gross_amount as string | undefined;
	const signatureKey = body.signature_key as string | undefined;

	if (statusCode && grossAmount && signatureKey) {
		if (!verifySignature(orderId, statusCode, grossAmount, signatureKey)) {
			console.warn(`[Midtrans Callback] Order ${orderId}: signature verification failed`);
			return json({ success: false, message: 'Invalid signature' }, { status: 401 });
		}
	}

	// ── Determine target status ─────────────────────────────────────────
	const target = mapMidtransStatus(transactionStatus, fraudStatus);
	if (!target) {
		// No transition needed — acknowledge receipt so Midtrans won't retry
		console.log(
			`[Midtrans Callback] Order ${orderId}: no transition for transaction_status=${transactionStatus}`,
		);
		return json({ success: true, message: 'No status transition needed' });
	}

	// ── Update the order ────────────────────────────────────────────────
	let pb: PocketBase | null = null;
	try {
		pb = await getAdminClient();

		const order = await pb.collection('orders').getOne(orderId);

		// Idempotency guard 1 — already in the target state
		if (order.status === target.status && order.order_status === target.orderStatus) {
			console.log(
				`[Midtrans Callback] Order ${orderId}: already in status=${target.status}, order_status=${target.orderStatus}`,
			);
			return json({ success: true, message: `Already in ${target.status} status` });
		}

		// Idempotency guard 2 — don't downgrade from a terminal status
		if (TERMINAL_STATUSES.has(order.status)) {
			console.log(
				`[Midtrans Callback] Order ${orderId}: terminal status ${order.status} — skipping downgrade to ${target.status}`,
			);
			return json({
				success: true,
				message: `Order already in terminal status ${order.status}`,
			});
		}

		const updateData: Record<string, unknown> = {
			status: target.status,
			order_status: target.orderStatus,
		};
		if (transactionId) {
			updateData.midtrans_transaction_id = transactionId;
		}

		await pb.collection('orders').update(orderId, updateData);

		console.log(
			`[Midtrans Callback] Order ${orderId}: transitioned to status=${target.status}, order_status=${target.orderStatus} (transaction_status=${transactionStatus})`,
		);
		return json({ success: true });
	} catch (err) {
		console.error('[Midtrans Callback Error]', err);
		return json(
			{
				success: false,
				message: err instanceof Error ? err.message : 'Internal server error',
			},
			{ status: 500 },
		);
	}
};
