<script lang="ts">
  import { goto, afterNavigate } from '$app/navigation';
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import { getProductsContext } from '$lib/stores/products.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import SearchIcon from '@lucide/svelte/icons/search';
  import HeartIcon from '@lucide/svelte/icons/heart';
  import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';

  let searchQuery = $state('');
  let scrolled = $state(false);
  let badgeVisible = $state(false);
  let wishlistBadgeVisible = $state(false);
  let auth = getAuthContext();
  let cart = getCartContext();
  let wishlist = getWishlistContext();
  let productStore = getProductsContext();
  let highlightIndex = $state(-1);
  let showSuggestions = $state(false);

  let cartCount = $derived(cart?.count ?? 0);
  let wishlistCount = $derived(wishlist?.ids?.length ?? 0);

  $effect(() => {
    badgeVisible = cartCount > 0;
  });

  $effect(() => {
    wishlistBadgeVisible = wishlistCount > 0;
  });

  $effect(() => {
    const onScroll = () => {
      scrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  });

  // Clear search on route changes
  afterNavigate(() => {
    searchQuery = '';
    showSuggestions = false;
  });

  let debouncedQuery = $state('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const q = searchQuery.trim();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      debouncedQuery = '';
      highlightIndex = -1;
      return;
    }
    debounceTimer = setTimeout(() => {
      debouncedQuery = q.toLowerCase();
      highlightIndex = -1;
    }, 300);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });

  let suggestions = $derived.by(() => {
    if (!debouncedQuery || !productStore?.products) return [];
    const q = debouncedQuery;
    return productStore.products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
      .slice(0, 8);
  });

  $effect(() => {
    showSuggestions = suggestions.length > 0;
  });

  function selectSuggestion(product: { slug: string }) {
    searchQuery = '';
    showSuggestions = false;
    goto(`/products/${product.slug}`);
  }

  function handleSearchSubmit(e: SubmitEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
      const selected = suggestions[highlightIndex];
      if (selected) {
        selectSuggestion(selected);
        return;
      }
    }
    searchQuery = '';
    showSuggestions = false;
    goto(`/products?search=${encodeURIComponent(q)}`);
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      searchQuery = '';
      showSuggestions = false;
      (e.target as HTMLInputElement)?.blur();
      return;
    }
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, suggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, -1);
    }
  }

  function handleSearchFocus() {
    if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      showSuggestions = true;
    }
  }

  let blurTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    return () => {
      if (blurTimer) clearTimeout(blurTimer);
    };
  });

  function handleSearchBlur() {
    if (blurTimer) clearTimeout(blurTimer);
    // Delay hiding so click on suggestion registers
    blurTimer = setTimeout(() => {
      showSuggestions = false;
      blurTimer = null;
    }, 150);
  }
</script>

<nav
  class="nav-container"
  class:scrolled
>
  <div class="nav-inner section-padding">
    <!-- Logo (left) -->
    <a href="/" class="logo" aria-label="ElectraStore home">
      Electra<span class="logo-accent">Store</span>
    </a>

    <!-- Search input (always visible, center) -->
    <div class="search-wrapper">
      <form class="search-form" onsubmit={handleSearchSubmit} role="search">
        <SearchIcon class="search-icon" />
        <Input
          type="search"
          class="search-input"
          placeholder="Search products..."
          aria-label="Search products"
          bind:value={searchQuery}
          onkeydown={handleSearchKeydown}
          onfocus={handleSearchFocus}
          onblur={handleSearchBlur}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
        />
      </form>

      <!-- Suggestions dropdown -->
      {#if showSuggestions}
        <ul class="suggestions-list" id="search-suggestions" role="listbox">
          {#each suggestions as product, i (product.id)}
            <li
              role="option"
              id="suggestion-{i}"
              aria-selected={highlightIndex === i}
            >
              <Button
                type="button"
                variant="ghost"
                class={highlightIndex === i ? 'suggestion-item suggestion-highlighted' : 'suggestion-item'}
                onmousedown={(e: MouseEvent) => e.preventDefault()}
                onclick={() => selectSuggestion(product)}
              >
                <span class="suggestion-name">{product.name}</span>
                <span class="suggestion-category">{product.expand?.category?.name ?? ''}</span>
                <span class="suggestion-price">${product.price.toLocaleString('en-US')}</span>
              </Button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Nav actions (right) -->
    <div class="nav-actions">
      <!-- Wishlist -->
      <Button href="/wishlist" variant="ghost" size="icon" class="action-btn" aria-label="Wishlist">
        <HeartIcon class="action-icon" />
        {#if wishlistBadgeVisible}
          <Badge class="action-badge absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 text-[0.5625rem] font-bold bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center leading-none">{wishlistCount}</Badge>
        {/if}
      </Button>

      <!-- Cart -->
      <Button href="/cart" variant="ghost" size="icon" class="action-btn" aria-label="Shopping bag, {cartCount} items">
        <ShoppingBagIcon class="action-icon" />
        {#if badgeVisible}
          <Badge class="action-badge absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 text-[0.5625rem] font-bold bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center leading-none">{cartCount}</Badge>
        {/if}
      </Button>

      <!-- Auth links (desktop) -->
      <div class="auth-links">
        {#if auth.isLoggedIn}
          <span class="auth-link auth-greeting">Hi, {auth.user?.name?.split(' ')[0] ?? 'User'}</span>
          <Button href="/profile" variant="ghost" class="auth-link">Profile</Button>
          <Button variant="ghost" class="auth-link" onclick={async () => { await auth.logout(); goto('/'); }}>Sign out</Button>
        {:else}
          <Button href="/login" variant="ghost" class="auth-link">Sign in</Button>
          <Button href="/register" class="auth-cta">Create Account</Button>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
  /* ─── Container & scroll backdrop ─── */
  .nav-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }

  .nav-container::after {
    content: '';
    position: absolute;
    inset: 0;
    border-bottom: 1px solid transparent;
    background-color: transparent;
    -webkit-backdrop-filter: blur(0px) saturate(100%);
    backdrop-filter: blur(0px) saturate(100%);
    transition:
      background-color 300ms var(--ease-out),
      backdrop-filter 300ms var(--ease-out),
      -webkit-backdrop-filter 300ms var(--ease-out),
      border-color 300ms var(--ease-out);
    z-index: -1;
    pointer-events: none;
  }

  .nav-container.scrolled::after {
    background-color: color-mix(in srgb, var(--color-bg) 72%, transparent);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
    border-bottom-color: color-mix(in srgb, var(--color-border) 40%, transparent);
  }

  .nav-inner {
    position: relative;
    z-index: 1;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  /* ─── Logo ─── */
  .logo {
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.025em;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: transform 160ms var(--ease-out);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .logo:active {
    transform: scale(0.97);
  }

  .logo-accent {
    color: var(--color-accent);
  }

  /* ─── Search wrapper ─── */
  .search-wrapper {
    position: relative;
    flex: 1;
    max-width: 360px;
    margin: 0 auto;
  }

  .search-form {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.25rem 0.625rem;
    transition:
      border-color 200ms var(--ease-out),
      background-color 200ms var(--ease-out);
  }

  .search-form:focus-within {
    border-color: var(--color-accent);
    background-color: color-mix(in srgb, var(--color-surface) 95%, #000);
  }

  .search-icon {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  :global(.search-input) {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    font-family: inherit;
    min-width: 0;
  }
  :global(.search-input)::placeholder {
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }

  :global(.search-input)::-webkit-search-cancel-button {
    display: none;
  }

  /* ─── Nav actions ─── */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  /* ─── Action button (icon buttons) ─── */
  :global(.action-btn) {
    position: relative;
    color: var(--color-text-secondary);
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-full);
    background: none;
    border: none;
    cursor: pointer;
    transition:
      color 160ms var(--ease-out),
      background-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  :global(.action-btn):active {
    transform: scale(0.93);
  }
  @media (hover: hover) and (pointer: fine) {
    :global(.action-btn):hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }
  }

  .action-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* ─── Auth links (desktop) ─── */
  .auth-links {
    display: none;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.25rem;
    padding-left: 0.5rem;
    border-left: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
  }
  @media (min-width: 768px) {
    .auth-links {
      display: flex;
    }
  }

  :global(.auth-link) {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-full);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 160ms var(--ease-out), background-color 200ms var(--ease-out), transform 160ms var(--ease-out);
  }

  .auth-greeting {
    color: var(--color-text-primary);
    cursor: default;
  }
  :global(.auth-link):active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    :global(.auth-link):hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
    }
  }

  :global(.auth-cta) {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
    background-color: var(--color-accent);
    text-decoration: none;
    padding: 0.375rem 1rem;
    border-radius: var(--radius-full);
    transition: background-color 200ms var(--ease-out), transform 160ms var(--ease-out);
  }
  :global(.auth-cta):active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    :global(.auth-cta):hover {
      background-color: var(--color-accent-hover);
    }
  }

  /* ─── Suggestions dropdown ─── */
  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0.25rem 0 0 0;
    padding: 0.375rem 0;
    list-style: none;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 52;
  }

  :global(.suggestion-item) {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: background-color 120ms var(--ease-out);
  }

  :global(.suggestion-highlighted),
  :global(.suggestion-item):hover {
    background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }

  .suggestion-name {
    flex: 1;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .suggestion-category {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .suggestion-price {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-accent);
    flex-shrink: 0;
    min-width: 3.5rem;
    text-align: right;
  }

  /* ─── Focus-visible for a11y ─── */
  :global(:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ─── Mobile responsive ─── */
  @media (max-width: 639px) {
    .search-wrapper {
      max-width: 100%;
    }
  }

  /* ─── Reduced motion ─── */
  @media (prefers-reduced-motion: reduce) {
    .nav-container::after,
    .logo,
    :global(.action-btn),
    .search-form,
    :global(.auth-link),
    :global(.auth-cta),
    :global(.suggestion-item) {
      transition-duration: 0.01ms !important;
    }
  }
</style>