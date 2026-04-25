<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import PriceDisplay from '$lib/components/PriceDisplay.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { CategoriesRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';
  import { getImageUrl } from '$lib/pb';

  let { params } = $props();

  const store = getProductsContext();
  let cart = getCartContext();
  let wishlist = getWishlistContext();

  let product = $state<ExpandedProduct | null>(null);
  let category = $state<CategoriesRecord | null>(null);

  $effect(() => {
    store.loadProductBySlug(params.slug).then(p => {
      product = p ?? null;
      category = p?.expand?.category ?? null;
    });
  });

  function emoji(): string {
    const map: Record<string, string> = { smartphones: '📱', laptops: '💻', audio: '🎧', wearables: '⌚', gaming: '🎮', accessories: '🔌' };
    return map[category?.slug ?? ''] ?? '📦';
  }

  function handleAddToBag() { if (product) cart.add(product.id); }
  function handleWishlistToggle() { if (product) wishlist.toggle(product.id); }

  /* ── Reveal elements when product loads ── */
  $effect(() => {
    product;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

{#if product}
  <div class="min-h-screen bg-bg">
    <nav class="section-padding pt-6 pb-2" aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5 text-sm text-text-secondary flex-wrap">
        <li><a href="/" class="hover:text-text-primary">Home</a></li>
        <li class="text-text-secondary/40">/</li>
        <li><a href="/products" class="hover:text-text-primary">Products</a></li>
        <li class="text-text-secondary/40">/</li>
        <li><a href="/products?category={category?.slug ?? ''}" class="hover:text-text-primary">{category?.name ?? ''}</a></li>
        <li class="text-text-secondary/40">/</li>
        <li class="text-text-primary font-medium">{product.name}</li>
      </ol>
    </nav>

    <div class="section-padding pb-12">
      <div class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16">
        <div class="reveal">
          <div class="aspect-square bg-surface rounded-lg flex items-center justify-center overflow-hidden">
            <span class="text-8xl">{emoji()}</span>
          </div>
        </div>

        <div class="flex flex-col gap-6 reveal" style="--stagger-index: 1">
          <span class="text-text-secondary uppercase text-xs tracking-widest font-medium">{category?.name ?? ''}</span>
          <h1 class="text-3xl font-bold text-text-primary">{product.name}</h1>
          <PriceDisplay price={product.price} originalPrice={(product.compare_at_price ?? 0) > 0 && (product.compare_at_price ?? 0) > product.price ? product.compare_at_price : undefined} />
          <p class="text-text-secondary text-base leading-relaxed">{product.description}</p>
          <button class="add-to-bag-btn btn-primary w-full text-center py-3 text-base font-semibold mt-2" onclick={handleAddToBag} disabled={(product.stock ?? 0) <= 0}>
            {(product.stock ?? 0) > 0 ? 'Add to Bag' : 'Out of Stock'}
          </button>
          <button class="wishlist-toggle" onclick={handleWishlistToggle} aria-label={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="wishlist-icon" viewBox="0 0 24 24" fill={wishlist.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span>{wishlist.has(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
          </button>
          <div class="flex items-start gap-2 text-sm text-text-secondary pt-2 border-t border-border">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0 mt-0.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m3 0H21M3.375 14.25h.008M21 14.25h-1.875M3.375 14.25L5.25 5.625h7.875" /></svg>
            <span>Free delivery. Estimated 3-5 business days.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if !store.loading}
  <div class="min-h-screen bg-bg flex items-center justify-center">
    <div class="text-center">
      <p class="text-6xl mb-4">🔍</p>
      <h1 class="text-3xl font-bold text-text-primary mb-2">Product Not Found</h1>
      <p class="text-text-secondary mb-6">The product you are looking for does not exist or has been removed.</p>
      <a href="/products" class="btn-primary inline-block px-6 py-3 text-base font-semibold">Browse Products</a>
    </div>
  </div>
{/if}

<style>
  .add-to-bag-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .wishlist-toggle { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: none; border: none; cursor: pointer; color: var(--color-text-secondary); font-size: 0.875rem; padding: 0.25rem 0; transition: color 160ms var(--ease-out), transform 160ms var(--ease-out); }
  .wishlist-toggle:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .wishlist-toggle:hover { color: var(--color-text-primary); } }
  .wishlist-icon { width: 1.25rem; height: 1.25rem; transition: fill 200ms var(--ease-out), filter 200ms var(--ease-out); }
  .wishlist-toggle:active .wishlist-icon { filter: blur(2px); }
  @media (prefers-reduced-motion: reduce) { .wishlist-toggle, .add-to-bag-btn { transition-duration: 0.01ms !important; } }
</style>