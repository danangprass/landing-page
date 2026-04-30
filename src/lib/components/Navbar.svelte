<script lang="ts">
  import { goto, afterNavigate } from '$app/navigation';
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getWishlistContext } from '$lib/stores/wishlist.svelte';
  import { getProductsContext } from '$lib/stores/products.svelte';

  let searchOpen = $state(false);
  let searchQuery = $state('');
  let scrolled = $state(false);
  let badgeVisible = $state(false);
  let wishlistBadgeVisible = $state(false);
  let auth = getAuthContext();
  let cart = getCartContext();
  let wishlist = getWishlistContext();
  let productStore = getProductsContext();
  let highlightIndex = $state(-1);

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

  // Lock body scroll when search panel is open
  $effect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  // Close search overlay on route changes so it doesn't persist across page navigations
  afterNavigate(() => {
    searchOpen = false;
    searchQuery = '';
  });

  function toggleSearch() {
    searchOpen = !searchOpen;
    if (!searchOpen) searchQuery = '';
  }

  function closeSearch() {
    searchOpen = false;
    searchQuery = '';
  }

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

  function selectSuggestion(product: { slug: string }) {
    closeSearch();
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
    closeSearch();
    goto(`/products?search=${encodeURIComponent(q)}`);
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (searchOpen) closeSearch();
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
</script>

<svelte:window onkeydown={handleSearchKeydown} />

<nav
  class="nav-container"
  class:scrolled
>
  <div class="nav-inner section-padding">
    <!-- Logo (left) -->
    <a href="/" class="logo" aria-label="ElectraStore home">
      Electra<span class="logo-accent">Store</span>
    </a>

    <!-- Nav actions (right) -->
    <div class="nav-actions">
      <!-- Search toggle -->
      <button class="action-btn" onclick={toggleSearch} aria-label="Search products" aria-expanded={searchOpen}>
        <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      <!-- Wishlist -->
      <a href="/wishlist" class="action-btn" aria-label="Wishlist">
        <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <span class="action-badge" class:visible={wishlistBadgeVisible}>
          {wishlistCount}
        </span>
      </a>

      <!-- Cart -->
      <a href="/cart" class="action-btn" aria-label="Shopping bag, {cartCount} items">
        <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m7.5 0h7.5l-1.5 10.5H5.25L3.75 10.5h7.5z" />
        </svg>
        <span class="action-badge" class:visible={badgeVisible}>
          {cartCount}
        </span>
      </a>

      <!-- Auth links (desktop) -->
      <div class="auth-links">
        {#if auth.isLoggedIn}
          <span class="auth-link auth-greeting">Hi, {auth.user?.name?.split(' ')[0] ?? 'User'}</span>
          <button class="auth-link" onclick={async () => { await auth.logout(); goto('/'); }}>Sign out</button>
        {:else}
          <a href="/login" class="auth-link">Sign in</a>
          <a href="/register" class="auth-cta">Create Account</a>
        {/if}
      </div>
    </div>
  </div>

  <!-- ─── Shared overlay (always mounted — CSS opacity enables exit animation) ─── -->
  <div
    class="nav-overlay"
    class:overlay-visible={searchOpen}
    onclick={() => { closeSearch(); }}
    role="presentation"
  ></div>

  <!-- ─── Search bar ─── -->
  <div class="search-bar" class:open={searchOpen}>
    <form class="search-bar-inner section-padding" onsubmit={handleSearchSubmit}>
      <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="search"
        class="search-input"
        placeholder="Search products..."
        aria-label="Search products"
        autofocus={searchOpen}
        bind:value={searchQuery}
        role="combobox"
        aria-expanded={searchQuery.trim().length >= 2}
        aria-controls="search-suggestions"
        aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
      />
      <button class="search-close" type="button" onclick={closeSearch} aria-label="Close search">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
    {#if suggestions.length > 0}
      <ul class="suggestions-list section-padding" id="search-suggestions" role="listbox">
        {#each suggestions as product, i (product.id)}
          <li
            role="option"
            id="suggestion-{i}"
            aria-selected={highlightIndex === i}
          >
            <button
              type="button"
              class="suggestion-item"
              class:suggestion-highlighted={highlightIndex === i}
              onclick={() => selectSuggestion(product)}
            >
              <span class="suggestion-name">{product.name}</span>
              <span class="suggestion-category">{product.expand?.category?.name ?? ''}</span>
              <span class="suggestion-price">${product.price.toLocaleString('en-US')}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
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
    margin-right: auto;
  }
  .logo:active {
    transform: scale(0.97);
  }

  .logo-accent {
    color: var(--color-accent);
  }

  /* ─── Nav actions ─── */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* ─── Action button (icon buttons) ─── */
  .action-btn {
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
  .action-btn:active {
    transform: scale(0.93);
  }
  @media (hover: hover) and (pointer: fine) {
    .action-btn:hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }
  }

  .action-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Badge */
  .action-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background-color: var(--color-accent);
    color: #ffffff;
    font-size: 0.5625rem;
    font-weight: 700;
    line-height: 1;
    min-width: 0.875rem;
    height: 0.875rem;
    padding: 0 2px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.7);
    opacity: 0;
    transition:
      transform 200ms var(--ease-spring),
      opacity 160ms var(--ease-out);
  }
  .action-badge.visible {
    transform: scale(1);
    opacity: 1;
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

  .auth-link {
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
  .auth-link:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .auth-link:hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
    }
  }

  .auth-cta {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
    background-color: var(--color-accent);
    text-decoration: none;
    padding: 0.375rem 1rem;
    border-radius: var(--radius-full);
    transition: background-color 200ms var(--ease-out), transform 160ms var(--ease-out);
  }
  .auth-cta:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .auth-cta:hover {
      background-color: var(--color-accent-hover);
    }
  }

  /* ─── Shared overlay (always mounted — CSS opacity enables exit animation) ─── */
  .nav-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    /* CSS transition: interruptible — reverses mid-way on rapid open/close */
    transition: opacity 200ms var(--ease-out);
  }
  .nav-overlay.overlay-visible {
    opacity: 1;
    pointer-events: auto;
  }

  /* ─── Search bar ─── */
  .search-bar {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-surface);
    border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    z-index: 51;
    transition:
      transform 300ms var(--ease-out),
      opacity 200ms var(--ease-out);
  }
  .search-bar.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .search-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 3rem;
  }

  .search-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 1rem;
    color: var(--color-text-primary);
    font-family: inherit;
  }
  .search-input::placeholder {
    color: var(--color-text-secondary);
  }

  .search-close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-full);
    transition: color 160ms var(--ease-out), background-color 200ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .search-close:hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }
  }


  /* ─── Focus-visible for a11y ─── */
  :global(:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ─── Suggestions dropdown ─── */
  .suggestions-list {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent);
    background-color: var(--color-surface);
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: background-color 120ms var(--ease-out);
  }

  .suggestion-highlighted,
  .suggestion-item:hover {
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
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-accent);
    flex-shrink: 0;
    min-width: 4rem;
    text-align: right;
  }

  /* ─── Reduced motion ─── */
  @media (prefers-reduced-motion: reduce) {
    .nav-container::after,
    .logo,
    .action-btn,
    .action-badge,
    .nav-overlay,
    .search-bar,
    .auth-link,
    .auth-cta,
    .search-close,
    .suggestion-item {
      transition-duration: 0.01ms !important;
    }
  }
</style>