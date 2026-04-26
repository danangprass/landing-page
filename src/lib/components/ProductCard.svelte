<script lang="ts">
  import type { ProductsRecord, CategoriesRecord } from '$lib/pb-types';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getImageUrl } from '$lib/pb';

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

  function handleAddToBag(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    cart.add(product.id);
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
      <span class="product-badge {badgeClass}">{badgeLabel}</span>
    {/if}

    <button
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
    </button>

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
        <span class="product-price">${product.price}</span>
        {#if onSale}
          <span class="product-original-price">${product.compare_at_price}</span>
        {/if}
      </div>

      <button class="btn-primary add-to-bag-btn" onclick={handleAddToBag}>
        Add to Bag
      </button>
    </div>
  </div>
</a>

<style>
  .product-card {
    text-decoration: none;
    color: inherit;
  }

  /* Image area */
  .product-image-area {
    position: relative;
    aspect-ratio: 1;
    background-color: var(--color-surface-hover);
    overflow: hidden;
  }

  .product-emoji-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    transition: transform 350ms var(--ease-spring);
  }

  .product-emoji {
    font-size: 3.75rem;
    line-height: 1;
    opacity: 0.5;
    color: var(--color-text-secondary);
  }

  /* Image hover: float + scale on pointer devices only */
  @media (hover: hover) and (pointer: fine) {
    .product-card:hover .product-emoji-wrap {
      transform: translateY(-4px) scale(1.05);
    }
  }

  /* Badge: enter from scale(0.95) + opacity 0, never scale(0) */
  .product-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 10;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius-full);
    animation: badge-enter 300ms var(--ease-out) both;
  }

  @keyframes badge-enter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .badge-new {
    background-color: var(--color-accent);
    color: #ffffff;
  }
  .badge-sale {
    background-color: var(--color-warning);
    color: #ffffff;
  }
  .badge-limited {
    background-color: var(--color-error);
    color: #ffffff;
  }

  /* Wishlist button */
  .wishlist-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background-color: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 200ms var(--ease-spring),
      background-color 200ms var(--ease-out);
  }

  .wishlist-btn:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .wishlist-btn:hover {
      transform: scale(1.08);
      background-color: rgba(255, 255, 255, 0.95);
    }
  }

  /* Heart fill transition with blur during state change */
  .wishlist-icon {
    width: 1rem;
    height: 1rem;
    transition:
      fill 200ms var(--ease-out),
      filter 200ms var(--ease-out);
    color: var(--color-text-primary);
  }

  .wishlist-btn:active .wishlist-icon {
    filter: blur(2px);
    transition:
      fill 100ms var(--ease-out),
      filter 100ms var(--ease-out);
  }

  /* Card press feedback */
  .product-card:active {
    transform: scale(0.97);
  }

  /* Info section */
  .product-info {
    padding: 1rem;
  }

  .product-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .product-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .product-desc {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.75rem;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .product-price-group {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .product-price {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .product-original-price {
    font-size: 0.875rem;
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  .add-to-bag-btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
</style>