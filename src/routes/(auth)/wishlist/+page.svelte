<script lang="ts">
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import Breadcrumb from '$lib/components/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/components/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/components/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/components/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/components/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/components/ui/breadcrumb/breadcrumb-separator.svelte';

  const wishlist = getWishlistContext();
  const cart = getCartContext();

  async function handleMoveToCart(productId: string, wishlistId: string) {
    try {
      await cart.add(productId);
      wishlist.remove(wishlistId);
    } catch {
      // cart.add already shows a toast on failure; wishlist item is kept
    }
  }
</script>

<svelte:head>
  <title>Wishlist — ElectraStore</title>
</svelte:head>

<div class="section-padding">
  <div class="py-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Wishlist</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="py-8 border-b border-border">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">
      Wishlist
    </h1>
    {#if wishlist.items.length > 0}
      <p class="mt-2 text-text-secondary text-sm">
        {wishlist.items.length} saved item{wishlist.items.length !== 1 ? 's' : ''}
      </p>
    {/if}
  </div>

  {#if wishlist.items.length === 0}
    <div class="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <svg class="w-16 h-16 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <p class="text-xl font-medium text-text-primary">Your wishlist is empty.</p>
      <p class="text-text-secondary">Save items you love to come back to them later.</p>
      <Button href="/products" class="mt-2">Browse Products</Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
      {#each wishlist.items as item (item.id)}
        <div class="wishlist-card">
          <a href="/products/{item.product.slug}" class="block">
            <div class="wishlist-image-placeholder">
              <span class="text-4xl">📦</span>
            </div>
            <div class="p-4">
              <h3 class="text-text-primary font-semibold text-sm leading-snug line-clamp-2">{item.product.name}</h3>
              <p class="text-text-primary font-bold mt-1">${item.product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </a>
          <div class="px-4 pb-4 flex gap-2">
            <Button
              class="flex-1 text-sm py-2"
              onclick={() => handleMoveToCart(item.product.id, item.id)}
            >
              Add to Bag
            </Button>
            <Button
              variant="outline"
              class="text-sm py-2 px-3"
              onclick={() => wishlist.remove(item.id)}
              aria-label="Remove from wishlist"
            >
              ✕
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wishlist-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color 200ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .wishlist-card:hover {
      border-color: color-mix(in srgb, var(--color-border) 60%, var(--color-accent));
    }
  }
  .wishlist-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10rem;
    background-color: color-mix(in srgb, var(--color-surface) 50%, var(--color-bg));
  }
</style>
