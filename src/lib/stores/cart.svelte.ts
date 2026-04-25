import { getContext, setContext } from 'svelte';
import { pb } from '$lib/pb';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';
import { getAuthContext } from './auth.svelte';
import type { CartItemsRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';

export interface CartItem {
  id: string;
  product: ExpandedProduct;
  quantity: number;
}

function createCartStore() {
  let items = $state<CartItem[]>([]);
  let loading = $state(false);
  let unsubRealtime: (() => void) | null = null;

  async function load() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;

    loading = true;
    const [result] = await safeCall(() =>
      pb.collection('cart_items').getFullList({
        expand: 'product',
        sort: '-created',
      }),
      { silent: true }
    );
    loading = false;

    if (result) {
      items = (result as unknown as (CartItemsRecord & { expand?: { product?: ExpandedProduct } })[]).map((record) => ({
        id: record.id,
        product: record.expand?.product as ExpandedProduct,
        quantity: record.quantity,
      }));
    }
  }

  async function add(productId: string, quantity = 1) {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      showToast('Please sign in to add items to your bag', 'info');
      return;
    }

    const existing = items.find(i => i.product.id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity);
      return;
    }

    const [result] = await safeCall(() =>
      pb.collection('cart_items').create({
        user: auth.user!.id,
        product: productId,
        quantity,
      })
    );

    if (result) {
      showToast('Added to bag', 'success');
      await load();
    }
  }

  async function remove(cartItemId: string) {
    const [, err] = await safeCall(() =>
      pb.collection('cart_items').delete(cartItemId)
    );
    if (!err) {
      items = items.filter(i => i.id !== cartItemId);
      showToast('Removed from bag', 'info');
    }
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await remove(cartItemId);
      return;
    }

    const [result] = await safeCall(() =>
      pb.collection('cart_items').update(cartItemId, { quantity })
    );

    if (result) {
      items = items.map(i =>
        i.id === cartItemId ? { ...i, quantity } : i
      );
    }
  }

  async function clear() {
    const deletePromises = items.map(i =>
      pb.collection('cart_items').delete(i.id)
    );
    await Promise.all(deletePromises);
    items = [];
  }

  function subscribeRealtime() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;

    unsubscribeRealtime();

    const userId = auth.user!.id;

    pb.collection('cart_items').subscribe('*', (e) => {
      if (e.record.user !== userId) return;
      // Reload to keep in sync with server state
      load();
    }, {
      filter: `user = "${userId}"`,
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
    get count() { return items.reduce((sum, i) => sum + i.quantity, 0); },
    get subtotal() { return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0); },
    get loading() { return loading; },
    load,
    add,
    remove,
    updateQuantity,
    clear,
    subscribeRealtime,
    unsubscribeRealtime,
  };
}

export type CartStore = ReturnType<typeof createCartStore>;

const CART_CONTEXT_KEY = Symbol('cart');

export function setCartContext() {
  const cart = createCartStore();
  setContext(CART_CONTEXT_KEY, cart);
  return cart;
}

export function getCartContext() {
  return getContext<CartStore>(CART_CONTEXT_KEY);
}