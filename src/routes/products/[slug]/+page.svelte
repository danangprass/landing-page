<script lang="ts">
  import { page } from '$app/state';
  import { getProductsContext } from '$lib/stores/products.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import PriceDisplay from '$lib/components/PriceDisplay.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import RatingStars from '$lib/components/RatingStars.svelte';
  import type { CategoriesRecord } from '$lib/pb-types';
  import type { ExpandedProduct } from '$lib/pb-types-ext';
  import { getImageUrl, pb } from '$lib/pb';
  import { safeCall } from '$lib/pb-error-handler.svelte';

  const store = getProductsContext();
  let cart = getCartContext();
  let wishlist = getWishlistContext();

  let product = $state<ExpandedProduct | null>(null);
  let category = $state<CategoriesRecord | null>(null);
  let rating = $state(0);
  let reviewCount = $state(0);

  $effect(() => {
    const slug = page.params.slug;
    if (!slug) return;
    store.loadProductBySlug(slug).then(p => {
      product = p ?? null;
      category = p?.expand?.category ?? null;
    });
  });

  $effect(() => {
    const p = product;
    if (!p) return;

    // Static data already has rating/reviewCount baked in
    if (p.rating !== undefined && p.reviewCount !== undefined) {
      rating = p.rating;
      reviewCount = p.reviewCount;
      return;
    }

    // Fetch review stats from PocketBase
    safeCall(() =>
      pb.collection('reviews').getList(1, 1000, {
        filter: `product = "${p.id}"`,
        fields: 'rating',
      })
    ).then(([result]) => {
      if (result && result.items.length > 0) {
        const items = result.items as unknown as { rating: number }[];
        const total = items.reduce((sum, r) => sum + r.rating, 0);
        rating = Math.round((total / items.length) * 10) / 10;
        reviewCount = items.length;
      }
    });
  });

  function emoji(): string {
    const map: Record<string, string> = { smartphones: '📱', laptops: '💻', audio: '🎧', wearables: '⌚', gaming: '🎮', accessories: '🔌' };
    return map[category?.slug ?? ''] ?? '📦';
  }

  function handleAddToBag() { if (product) cart.add(product.id, 1, product); }
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
            {#if product.images && product.images.length > 0}
              <img src={getImageUrl(product.images[0], '400x400')} alt={product.name} class="w-full h-full object-cover" />
            {:else}
              <span class="text-8xl">{emoji()}</span>
            {/if}
          </div>
        </div>

        <div class="flex flex-col gap-6 reveal" style="--stagger-index: 1">
          <span class="text-text-secondary uppercase text-xs tracking-widest font-medium">{category?.name ?? ''}</span>
          <h1 class="text-3xl font-bold text-text-primary">{product.name}</h1>
          {#if rating > 0}
            <RatingStars {rating} count={reviewCount} />
          {/if}
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

    <!-- Specifications -->
    <div class="section-padding pb-12">
      <div class="reveal">
        <h2 class="text-2xl font-semibold text-text-primary mb-6">Specifications</h2>
        <div class="specs-table">
          <div class="specs-row">
            <span class="specs-label">Category</span>
            <span class="specs-value">{category?.name ?? '-'}</span>
          </div>
          <div class="specs-row">
            <span class="specs-label">Price</span>
            <span class="specs-value">${product.price.toLocaleString('en-US')}</span>
          </div>
          {#if (product.compare_at_price ?? 0) > 0 && (product.compare_at_price ?? 0) > product.price}
          <div class="specs-row">
            <span class="specs-label">Original Price</span>
            <span class="specs-value line-through">${(product.compare_at_price ?? 0).toLocaleString('en-US')}</span>
          </div>
          {/if}
          <div class="specs-row">
            <span class="specs-label">Availability</span>
            <span class="specs-value">{(product.stock ?? 0) > 0 ? 'In Stock' + ' (' + product.stock + ' units)' : 'Out of Stock'}</span>
          </div>
          {#if product.featured}
          <div class="specs-row">
            <span class="specs-label">Featured</span>
            <span class="specs-value text-accent">Featured Product</span>
          </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div class="section-padding pb-16">
      <div class="reveal">
        <h2 class="text-2xl font-semibold text-text-primary mb-6">You Might Also Like</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {#each store.products.filter(p => p.id !== product!.id).slice(0, 4) as related (related.id)}
            <ProductCard product={related} category={related.expand?.category} />
          {/each}
        </div>
        {#if store.products.filter(p => p.id !== product!.id).length === 0}
          <p class="text-text-secondary">Browse more products in <a href="/products" class="text-accent">All Products</a>.</p>
        {/if}
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
  .specs-table { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
  .specs-row { display: flex; border-bottom: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent); }
  .specs-row:last-child { border-bottom: none; }
  .specs-label { width: 180px; flex-shrink: 0; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); padding: 0.75rem 1rem; background-color: color-mix(in srgb, var(--color-text-primary) 3%, transparent); }
  .specs-value { flex: 1; font-size: 0.8125rem; color: var(--color-text-primary); padding: 0.75rem 1rem; }
  @media (max-width: 767px) { .specs-label { width: 120px; } }
  @media (prefers-reduced-motion: reduce) { .wishlist-toggle, .add-to-bag-btn { transition-duration: 0.01ms !important; } }
</style>