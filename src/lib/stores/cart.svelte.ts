import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import { pb } from '$lib/pb';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';
import { getAuthContext } from './auth.svelte';
import type { CartItemsRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';
import { products as staticProducts } from '$lib/data/products';
import type { Product } from '$lib/data/products';

export interface CartItem {
  id: string;
  product: ExpandedProduct;
  quantity: number;
}

interface LocalCartEntry {
  productId: string;
  quantity: number;
  product: ExpandedProduct;
}

const LOCAL_CART_KEY = 'anonymous_cart';

function getLocalCart(): LocalCartEntry[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalCartEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err instanceof Error && err.name === 'SecurityError') {
      showToast('Storage access blocked. Please disable private browsing or adjust cookie settings.', 'error');
    }
    return [];
  }
}

function setLocalCart(entries: LocalCartEntry[]) {
  if (!browser) return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(entries));
  } catch (err) {
    if (err instanceof Error && err.name === 'SecurityError') {
      showToast('Storage access blocked. Your cart will not persist between sessions.', 'error');
    }
    // storage may be full or unavailable
  }
}

function clearLocalCart() {
  if (!browser) return;
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch (err) {
    if (err instanceof Error && err.name === 'SecurityError') {
      showToast('Storage access blocked.', 'error');
    }
    // ignore
  }
}

function mapStaticProduct(p: Product): ExpandedProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compare_at_price: p.originalPrice,
    description: p.description,
    images: p.images as unknown as ExpandedProduct['images'],
    featured: p.badge === 'new',
    stock: p.inStock ? 99 : 0,
    active: true,
    sku: p.slug,
    expand: {
      category: {
        id: 'static-' + p.categorySlug,
        name: p.category,
        slug: p.categorySlug,
        active: true,
      } as unknown as import('$lib/pb-types').CategoriesRecord,
    },
  } as ExpandedProduct;
}

function createCartStore() {
  let items = $state<CartItem[]>([]);
  let loading = $state(false);
  let adding = $state(false);
  let merging = $state(false);
  let unsubRealtime: (() => void) | null = null;

  async function load() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      const local = getLocalCart();
      items = local.map((entry) => ({
        id: `local-${entry.productId}`,
        product: entry.product,
        quantity: entry.quantity,
      }));
      return;
    }

    loading = true;
    const [result, err] = await safeCall(async () => {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error(`Failed to load cart: ${res.status}`);
      return res.json();
    }, { silent: true });
    loading = false;

    if (result) {
      items = (result as (CartItemsRecord & { expand?: { product?: ExpandedProduct } })[])
        .map((record) => ({
          id: record.id,
          product: record.expand?.product as ExpandedProduct,
          quantity: record.quantity,
        }));
    } else if (err) {
      showToast(err.message, 'error');
    }

    // Merge anonymous cart into server cart after successful load
    if (merging) return;
    const local = getLocalCart();
    if (local.length > 0) {
      merging = true;
      for (const entry of local) {
        const existing = items.find((i) => i.product.id === entry.productId);
        if (existing) {
          const [updated, updateErr] = await safeCall(async () => {
            const res = await fetch(`/api/cart/${existing.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: existing.quantity + entry.quantity }),
            });
            if (!res.ok) throw new Error(`Failed to update item: ${res.status}`);
            return res.json();
          });
          if (updated) {
            items = items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: (updated as unknown as CartItemsRecord).quantity }
                : i
            );
          } else if (updateErr) {
            showToast(updateErr.message, 'error');
          }
        } else {
          const [created, createErr] = await safeCall(async () => {
            const res = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product: entry.productId, quantity: entry.quantity }),
            });
            if (!res.ok) throw new Error(`Failed to add item: ${res.status}`);
            return res.json();
          });
          if (created) {
            items = [
              ...items,
              {
                id: (created as unknown as { id: string }).id,
                product: entry.product,
                quantity: entry.quantity,
              },
            ];
          } else if (createErr) {
            showToast(createErr.message, 'error');
          }
        }
      }
      merging = false;
      clearLocalCart();
      showToast('Your bag items have been saved to your account', 'success');
    }
  }

  async function add(productId: string, quantity = 1, productSnapshot?: ExpandedProduct) {
    if (adding || merging) return;
    adding = true;

    try {
      const auth = getAuthContext();
      if (!auth.isLoggedIn) {
        let product = productSnapshot;
        if (!product) {
          const [result] = await safeCall(() =>
            pb.collection('products').getOne(productId, { expand: 'category' }),
            { silent: true }
          );
          if (result) {
            product = result as unknown as ExpandedProduct;
          } else {
            const staticProd = staticProducts.find((p) => p.id === productId);
            if (staticProd) {
              product = mapStaticProduct(staticProd);
            }
          }
        }
        if (!product) {
          showToast('Product not found', 'error');
          return;
        }

        const local = getLocalCart();
        const existing = local.find((i) => i.productId === productId);
        const updatedLocal = existing
          ? local.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i)
          : [...local, { productId, quantity, product }];
        setLocalCart(updatedLocal);
        items = updatedLocal.map((entry) => ({
          id: `local-${entry.productId}`,
          product: entry.product,
          quantity: entry.quantity,
        }));
        showToast('Added to bag', 'success');
        return;
      }

      const existing = items.find(i => i.product.id === productId);
      if (existing) {
        if (!items.some(i => i.id === existing.id)) return;
        await updateQuantity(existing.id, existing.quantity + quantity);
        return;
      }

      const [result, err] = await safeCall(async () => {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: productId, quantity }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `Failed to add item: ${res.status}`);
        }
        return res.json();
      });

      if (result) {
        showToast('Added to bag', 'success');
        await load();
      } else if (err) {
        showToast(err.message, 'error');
      }
    } finally {
      adding = false;
    }
  }

  async function remove(cartItemId: string) {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      const local = getLocalCart().filter((i) => `local-${i.productId}` !== cartItemId);
      setLocalCart(local);
      items = local.map((entry) => ({
        id: `local-${entry.productId}`,
        product: entry.product,
        quantity: entry.quantity,
      }));
      showToast('Removed from bag', 'info');
      return;
    }
    if (!items.some(i => i.id === cartItemId)) return;

    const [, err] = await safeCall(async () => {
      const res = await fetch(`/api/cart/${cartItemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to remove item: ${res.status}`);
      return res.json();
    });
    if (!err) {
      items = items.filter(i => i.id !== cartItemId);
      showToast('Removed from bag', 'info');
    } else {
      showToast(err.message, 'error');
    }
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await remove(cartItemId);
      return;
    }

    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      const local = getLocalCart();
      const updatedLocal = local.map((e) =>
        `local-${e.productId}` === cartItemId ? { ...e, quantity } : e
      );
      setLocalCart(updatedLocal);
      items = updatedLocal.map((e) => ({
        id: `local-${e.productId}`,
        product: e.product,
        quantity: e.quantity,
      }));
      return;
    }
    if (!items.some(i => i.id === cartItemId)) return;

    const [result, err] = await safeCall(async () => {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(`Failed to update item: ${res.status}`);
      return res.json();
    });

    if (result) {
      items = items.map(i =>
        i.id === cartItemId ? { ...i, quantity: (result as unknown as CartItemsRecord).quantity } : i
      );
    } else if (err) {
      showToast(err.message, 'error');
    }
  }

  async function clear() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) {
      clearLocalCart();
      items = [];
      return;
    }
    const snapshot = [...items];
    const results = await Promise.allSettled(
      snapshot.map(i =>
        fetch(`/api/cart/${i.id}`, { method: 'DELETE' }).then(r => {
          if (!r.ok) throw new Error(`Failed to delete ${i.id}: ${r.status}`);
        })
      )
    );
    const failed = results
      .map((r, idx) => (r.status === 'rejected' ? snapshot[idx] : null))
      .filter((i): i is CartItem => i !== null);
    if (failed.length > 0) {
      items = failed;
      showToast(`Failed to clear ${failed.length} item(s)`, 'error');
    } else {
      items = [];
    }
  }

  function subscribeRealtime() {
    const auth = getAuthContext();
    if (!auth.isLoggedIn) return;

    const oldUnsub = unsubRealtime;
    unsubRealtime = null;
    if (oldUnsub) oldUnsub();

    const userId = auth.user!.id;

    pb.collection('cart_items').subscribe('*', (e) => {
      if (e.record.user !== userId) return;
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
    get count() { return items.reduce((sum, i) => sum + i.quantity, 0); },
    get subtotal() { return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0); },
    get loading() { return loading; },
    get adding() { return adding; },
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
