import { getContext, setContext } from 'svelte';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';
import { getAuthContext } from './auth.svelte';
import type { WishlistsRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';

export interface WishlistItem {
	id: string;
	product: ExpandedProduct;
}

function createWishlistStore() {
	const auth = getAuthContext();

	let items = $state<WishlistItem[]>([]);
	let loading = $state(false);
	let loadedForAuth = $state(false);

	async function load(force = false) {
		if (!auth.isLoggedIn || loading || (!force && loadedForAuth && auth.isLoggedIn)) return;

		loading = true;
		const [result, err] = await safeCall(async () => {
			const res = await fetch('/api/wishlist');
			if (!res.ok) throw new Error(`Failed to load wishlist: ${res.status}`);
			return res.json();
		}, { silent: true });
		loading = false;

		if (result) {
			items = (result as (WishlistsRecord & { expand?: { product?: ExpandedProduct } })[])
				.map((record) => ({
					id: record.id,
					product: record.expand?.product as ExpandedProduct | undefined,
				}))
				.filter((item): item is WishlistItem => !!item.product);
		}
		loadedForAuth = true;
	}

	function has(productId: string): boolean {
		return items.some(i => i.product?.id === productId);
	}

	async function toggle(productId: string) {
		if (!auth.isLoggedIn) {
			showToast('Please sign in to save items', 'info');
			return;
		}

		const existing = items.find(i => i.product?.id === productId);
		if (existing) {
			if (!items.some(i => i.id === existing.id)) return;
			const [, err] = await safeCall(async () => {
				const res = await fetch(`/api/wishlist/${existing.id}`, { method: 'DELETE' });
				if (!res.ok) throw new Error(`Failed to remove item: ${res.status}`);
				return res.json();
			});
			if (!err) {
				items = items.filter(i => i.id !== existing.id);
				showToast('Removed from wishlist', 'info');
			} else {
				showToast(err.message, 'error');
			}
		} else {
			const [result, err] = await safeCall(async () => {
				const res = await fetch('/api/wishlist', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ product: productId }),
				});
				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data.message || `Failed to add item: ${res.status}`);
				}
				return res.json();
			});
			if (result) {
				showToast('Added to wishlist', 'success');
				await load(true);
			} else if (err) {
				showToast(err.message, 'error');
			}
		}
	}

	async function remove(wishlistId: string) {
		if (!auth.isLoggedIn) return;
		if (!items.some(i => i.id === wishlistId)) return;

		const [, err] = await safeCall(async () => {
			const res = await fetch(`/api/wishlist/${wishlistId}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(`Failed to remove item: ${res.status}`);
			return res.json();
		});
		if (!err) {
			items = items.filter(i => i.id !== wishlistId);
			showToast('Removed from wishlist', 'info');
		} else {
			showToast(err.message, 'error');
		}
	}

	function subscribeRealtime() {
		// Realtime via browser pb client is not auth-enabled (MemoryAuthStore has no token).
		// wishlist state is refreshed on toggle and page load instead.
	}

	function unsubscribeRealtime() {
		// no-op
	}

	return {
		get items() { return items; },
		get ids() { return items.map(i => i.product?.id).filter((id): id is string => !!id); },
		get loading() { return loading; },
		has,
		toggle,
		remove,
		load,
		subscribeRealtime,
		unsubscribeRealtime,
	};
}

export type WishlistStore = ReturnType<typeof createWishlistStore>;

const WISHLIST_CONTEXT_KEY = Symbol('wishlist');

export function setWishlistContext() {
	const wishlist = createWishlistStore();
	setContext(WISHLIST_CONTEXT_KEY, wishlist);
	return wishlist;
}

export function getWishlistContext() {
	return getContext<WishlistStore>(WISHLIST_CONTEXT_KEY);
}
