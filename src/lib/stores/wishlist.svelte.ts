import { getContext, setContext } from 'svelte';
import { pb } from '$lib/pb';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';
import { getAuthContext } from './auth.svelte';
import type { WishlistsRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';

export interface WishlistItem {
  id: string;
  product: ExpandedProduct;
}

function createWishlistStore() {
  let items = $state<WishlistItem[]>([]);
  let loading = $state(false);
  let unsubRealtime: (() => void) | null = null;

  async function load() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;

    const userId = auth.user!.id;
    loading = true;
    const [result] = await safeCall(() =>
      pb.collection('wishlists').getFullList({
        expand: 'product',
        sort: '-created',
        filter: `user = "${userId.replace(/"/g, '\\"')}"`,
      }),
      { silent: true }
    );
    loading = false;

    if (result) {
      items = (result as unknown as (WishlistsRecord & { expand?: { product?: ExpandedProduct } })[])
        .filter((record) => record.user === userId)
        .map((record) => ({
          id: record.id,
          product: record.expand?.product as ExpandedProduct,
        }));
    }
  }

  function has(productId: string): boolean {
    return items.some(i => i.product.id === productId);
  }

  async function toggle(productId: string) {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      showToast('Please sign in to save items', 'info');
      return;
    }

    const existing = items.find(i => i.product.id === productId);
    if (existing) {
      if (!items.some(i => i.id === existing.id)) return;
      const [, err] = await safeCall(() =>
        pb.collection('wishlists').delete(existing.id)
      );
      if (!err) {
        items = items.filter(i => i.id !== existing.id);
        showToast('Removed from wishlist', 'info');
      }
    } else {
      const [result] = await safeCall(() =>
        pb.collection('wishlists').create({
          user: auth.user!.id,
          product: productId,
        })
      );
      if (result) {
        showToast('Added to wishlist', 'success');
        await load();
      }
    }
  }

  async function remove(wishlistId: string) {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;
    if (!items.some(i => i.id === wishlistId)) return;

    const [, err] = await safeCall(() =>
      pb.collection('wishlists').delete(wishlistId)
    );
    if (!err) {
      items = items.filter(i => i.id !== wishlistId);
      showToast('Removed from wishlist', 'info');
    }
  }

  function subscribeRealtime() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;

    const oldUnsub = unsubRealtime;
    unsubRealtime = null;
    if (oldUnsub) oldUnsub();

    const userId = auth.user!.id;

    pb.collection('wishlists').subscribe('*', () => {
      load();
    }, {
      filter: `user = "${userId.replace(/"/g, '\\"')}"`,
    }).then((unsub) => {
      unsubRealtime = unsub;
    });
  }

  function unsubscribeRealtime() {
    if (unsubRealtime) {
      unsubRealtime();
      unsubRealtime = null;
    }
  }

  return {
    get items() { return items; },
    get ids() { return items.map(i => i.product.id); },
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