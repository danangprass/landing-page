<script lang="ts">
  import type { ProductsRecord, CategoriesRecord } from '$lib/pb-types';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getImageUrl } from '$lib/pb';
  import Button from '$lib/components/ui/button/button.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let { product, category }: { product: ProductsRecord; category?: CategoriesRecord } = $props();

  let wishlist = getWishlistContext();
  let cart = getCartContext();

  let categorySlug = $derived(category?.slug ?? '');
  let isWishlisted = $derived(wishlist.has(product.id));
  let onSale = $derived((product.compare_at_price ?? 0) > 0 && (product.compare_at_price ?? 0) > product.price);
  let badgeLabel = $derived(product.featured ? 'New' : onSale ? 'Sale' : '');
  let badgeClass = $derived(product.featured ? 'badge-new' : onSale ? 'badge-sale' : '');
  let emoji = $derived(
    categorySlug === 'smartphones'
      ? '📱'
      : categorySlug === 'laptops'
        ? '💻'
        : categorySlug === 'audio'
          ? '🎧'
          : categorySlug === 'wearables'
            ? '⌚'
            : '🔌'
  );

  function formatPrice(dollars: number): string {
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function handleAddToBag(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    cart.add(product.id, 1, product as unknown as import('$lib/pb-types-ext').ExpandedProduct);
  }

  function handleWishlistToggle(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    wishlist.toggle(product.id);
  }
</script>

<a href="/products/{product.slug}" class="card product-card block">
  <div class="product-image-area">
    {#if badgeLabel}
      <Badge class="product-badge {badgeClass}">{badgeLabel}</Badge>
    {/if}

    <Button
      variant="ghost"
      size="icon"
      class="wishlist-btn"
      onclick={handleWishlistToggle}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="wishlist-icon"
        viewBox="0 0 24 24"
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </Button>

    <div class="product-emoji-wrap">
      <span class="product-emoji">{emoji}</span>
    </div>

  </div>

  <div class="product-info">
    <p class="product-category">{category?.name ?? ''}</p>
    <h3 class="product-name">{product.name}</h3>
    <p class="product-desc">{(product.description ?? '').slice(0, 80)}...</p>

    <div class="product-footer">
      <div class="product-price-group">
        <span class="product-price">{formatPrice(product.price)}</span>
        {#if onSale && (product.compare_at_price ?? 0) > 0}
          <span class="product-original-price">{formatPrice(product.compare_at_price!)}</span>
        {/if}
      </div>

      <Button class="add-to-bag-btn" onclick={handleAddToBag} aria-label="Add {product.name} to bag">
        Add to Bag
      </Button>
    </div>
  </div>
</a>

<style>
  .product-card {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
  }

  /* ── Image area ── */
  .product-image-area {
    position: relative;
    aspect-ratio: 1;
    background: radial-gradient(ellipse at 60% 40%, var(--color-surface) 0%, var(--color-surface-hover) 100%);
    overflow: hidden;
    flex-shrink: 0;
  }

  :global(.product-emoji-wrap) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    transition: transform 400ms var(--ease-spring);
  }

  :global(.product-emoji) {
    font-size: 4.5rem;
    line-height: 1;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12));
    transition: filter 300ms var(--ease-out);
  }

  /* ── Hover: image floats ── */
  @media (hover: hover) and (pointer: fine) {
    .product-card:hover .product-emoji-wrap {
      transform: translateY(-6px) scale(1.08);
    }

    .product-card:hover .product-emoji {
      filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.18));
    }
  }

  /* ── Badge ── */
  :global(.product-badge) {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 10;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 0.2rem 0.625rem;
    border-radius: var(--radius-full);
    animation: badge-enter 300ms var(--ease-out) both;
  }

  @keyframes badge-enter {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  :global(.badge-new)  { background-color: var(--color-accent);   color: #fff; }
  :global(.badge-sale) { background-color: var(--color-warning);  color: #fff; }

  /* ── Wishlist button ── */
  :global(.wishlist-btn) {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 200ms var(--ease-spring),
      background-color 200ms var(--ease-out);
  }

  :global(.wishlist-btn):active { transform: scale(0.94); }

  @media (hover: hover) and (pointer: fine) {
    :global(.wishlist-btn):hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 1);
    }
  }

  .wishlist-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-primary);
    transition: fill 200ms var(--ease-out), filter 200ms var(--ease-out);
  }

  :global(.wishlist-btn):active .wishlist-icon {
    filter: blur(2px);
    transition: fill 100ms var(--ease-out), filter 100ms var(--ease-out);
  }

  /* ── Card press ── */
  .product-card:active { transform: scale(0.98); }

  /* ── Info section ── */
  .product-info {
    padding: 1rem 1rem 1.125rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .product-category {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-secondary);
    margin-bottom: 0.375rem;
  }

  /* Fixed 2-line height — names of any length occupy identical space */
  .product-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.375rem;
    line-height: 1.3;
    height: 2.6rem; /* 2 × 1rem × 1.3 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Fixed 2-line height — descriptions of any length occupy identical space */
  .product-desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    height: 2.4375rem; /* 2 × 0.8125rem × 1.5 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Footer: pushed to bottom, stacked so price never competes with button ── */
  .product-footer {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-top: auto;
    padding-top: 0.75rem;
  }

  .product-price-group {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .product-price {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .product-original-price {
    font-size: 0.8125rem;
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  /* ── Full-width CTA (touch + non-hover fallback) ── */
  :global(.add-to-bag-btn) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-accent);
    color: #fff;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-full);
    border: none;
    cursor: pointer;
    transition:
      background-color 160ms var(--ease-out),
      transform 160ms var(--ease-spring),
      opacity 200ms var(--ease-out);
  }

  :global(.add-to-bag-btn):hover { background-color: var(--color-accent-hover); }
  :global(.add-to-bag-btn):active { transform: scale(0.97); }

  /* Reduced motion: keep opacity, no transforms */
  @media (prefers-reduced-motion: reduce) {
    :global(.product-emoji-wrap),
    :global(.add-to-bag-btn),
    :global(.wishlist-btn) {
      transition: none;
    }
  }
</style>
