<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';

  let {
    selectedCategory = '',
    priceRange = [0, 2000],
    sortBy = 'featured',
    onCategoryChange,
    onSortChange,
    onPriceChange,
    onClose,
    onClearAll
  }: {
    selectedCategory?: string;
    priceRange?: number[];
    sortBy?: string;
    onCategoryChange: (cat: string) => void;
    onSortChange: (sort: string) => void;
    onPriceChange: (range: number[]) => void;
    onClose?: () => void;
    onClearAll?: () => void;
  } = $props();

  let store = getProductsContext();
  let categories = $derived(store.categories);

  let minPrice = $state(0);
  let maxPrice = $state(2000);
  let expandedSections = $state<Record<string, boolean>>({
    sort: true,
    category: true,
    price: true
  });

  $effect(() => {
    minPrice = priceRange[0];
    maxPrice = priceRange[1];
  });

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Top Rated' }
  ];

  function toggleSection(key: string) {
    expandedSections[key] = !expandedSections[key];
  }

  function applyPrice() {
    onPriceChange([minPrice, maxPrice]);
  }

  function handleClearAll() {
    minPrice = 0;
    maxPrice = 2000;
    onClearAll?.();
  }

  let hasActiveFilters = $derived(
    selectedCategory !== '' || sortBy !== 'featured' || priceRange[0] !== 0 || priceRange[1] !== 2000
  );

  let activeFilterCount = $derived.by(() => {
    let count = 0;
    if (selectedCategory !== '') count++;
    if (sortBy !== 'featured') count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) count++;
    return count;
  });
</script>

<div class="filter-sidebar">
  <!-- Mobile header -->
  <div class="filter-header">
    <div class="filter-header-left">
      <h2 class="filter-title">Filters</h2>
      {#if activeFilterCount > 0}
        <span class="filter-count-badge">{activeFilterCount}</span>
      {/if}
    </div>
    <div class="filter-header-actions">
      {#if hasActiveFilters}
        <button class="clear-all-btn" onclick={handleClearAll}>Clear all</button>
      {/if}
      {#if onClose}
        <button class="filter-close-btn" onclick={onClose} aria-label="Close filters">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Desktop: Clear all -->
  {#if hasActiveFilters}
    <div class="desktop-clear">
      <button class="clear-all-btn" onclick={handleClearAll}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        Clear all filters
      </button>
    </div>
  {/if}

  <!-- Browse navigation -->
  <nav class="browse-nav" aria-label="Browse">
    <a href="/" class="browse-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
      Home
    </a>
    <a href="/products" class="browse-link" class:active={true}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
      Products
    </a>
  </nav>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Sort -->
  <section class="filter-section">
    <button class="filter-section-toggle" onclick={() => toggleSection('sort')} aria-expanded={expandedSections.sort}>
      <h3 class="filter-section-heading">Sort By</h3>
      <svg class="chevron" class:rotated={expandedSections.sort} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    {#if expandedSections.sort}
      <div class="filter-options" style="--stagger-index: 0">
        {#each sortOptions as option}
          <label class="filter-radio">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={sortBy === option.value}
              onchange={() => onSortChange(option.value)}
            />
            <span class="filter-radio-label" class:active={sortBy === option.value}>{option.label}</span>
          </label>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Categories -->
  <section class="filter-section">
    <button class="filter-section-toggle" onclick={() => toggleSection('category')} aria-expanded={expandedSections.category}>
      <h3 class="filter-section-heading">Category</h3>
      <svg class="chevron" class:rotated={expandedSections.category} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    {#if expandedSections.category}
      <div class="filter-pills" style="--stagger-index: 1">
        <button
          class="filter-pill"
          class:active={selectedCategory === ''}
          onclick={() => onCategoryChange('')}
        >
          All
        </button>
        {#each categories as cat}
          <button
            class="filter-pill"
            class:active={selectedCategory === cat.slug}
            onclick={() => onCategoryChange(cat.slug)}
          >
            {cat.name}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Price Range -->
  <section class="filter-section">
    <button class="filter-section-toggle" onclick={() => toggleSection('price')} aria-expanded={expandedSections.price}>
      <h3 class="filter-section-heading">Price Range</h3>
      <svg class="chevron" class:rotated={expandedSections.price} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    {#if expandedSections.price}
      <div class="price-section" style="--stagger-index: 2">
        <div class="price-range-display">
          <span class="price-value">${priceRange[0]}</span>
          <span class="price-dash">&mdash;</span>
          <span class="price-value">${priceRange[1]}</span>
        </div>
        <div class="price-inputs">
          <div class="price-field">
            <label class="price-label" for="min-price">Min ($)</label>
            <input
              id="min-price"
              type="number"
              bind:value={minPrice}
              min="0"
              max={maxPrice}
              class="price-input"
            />
          </div>
          <div class="price-field">
            <label class="price-label" for="max-price">Max ($)</label>
            <input
              id="max-price"
              type="number"
              bind:value={maxPrice}
              min={minPrice}
              class="price-input"
            />
          </div>
        </div>
        <button class="apply-btn" onclick={applyPrice}>Apply Price</button>
      </div>
    {/if}
  </section>
</div>

<style>
  .filter-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ─── Header ─── */
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent);
  }

  @media (min-width: 768px) {
    .filter-header {
      display: none;
    }
  }

  .filter-header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .filter-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.375rem;
    border-radius: var(--radius-full);
    background-color: var(--color-accent);
    color: var(--color-bg);
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
  }

  .filter-header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-full);
    transition:
      color 200ms var(--ease-out),
      background-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .filter-close-btn:active {
    transform: scale(0.93);
  }
  @media (hover: hover) and (pointer: fine) {
    .filter-close-btn:hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }
  }

  /* ─── Desktop clear all ─── */
  .desktop-clear {
    display: none;
    margin-bottom: 0.75rem;
  }
  @media (min-width: 768px) {
    .desktop-clear {
      display: block;
    }
  }

  .clear-all-btn {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-accent);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    transition: color 160ms var(--ease-out), opacity 160ms var(--ease-out);
  }
  .clear-all-btn:active {
    opacity: 0.7;
  }
  @media (hover: hover) and (pointer: fine) {
    .clear-all-btn:hover {
      color: var(--color-accent-hover);
    }
  }

  /* ─── Browse nav ─── */
  .browse-nav {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    margin-bottom: 0.25rem;
  }

  .browse-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    padding: 0.4375rem 0.5rem;
    border-radius: var(--radius-sm);
    transition: color 160ms var(--ease-out), background-color 160ms var(--ease-out);
  }
  .browse-link:active {
    transform: scale(0.98);
  }
  @media (hover: hover) and (pointer: fine) {
    .browse-link:hover {
      color: var(--color-text-primary);
      background-color: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
    }
  }
  .browse-link.active {
    color: var(--color-accent);
  }
  .browse-link svg {
    flex-shrink: 0;
  }

  /* ─── Section divider ─── */
  .section-divider {
    height: 1px;
    background-color: color-mix(in srgb, var(--color-border) 40%, transparent);
    margin: 0.25rem 0;
  }

  /* ─── Section toggle ─── */
  .filter-section {
    padding: 0.875rem 0;
  }

  .filter-section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 0.75rem;
  }

  .filter-section-heading {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .chevron {
    color: var(--color-text-secondary);
    transition: transform 200ms var(--ease-out);
    flex-shrink: 0;
  }
  .chevron.rotated {
    transform: rotate(180deg);
  }

  /* ─── Radio options ─── */
  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    animation: section-reveal 300ms var(--ease-out) both;
    animation-delay: calc(var(--stagger-index, 0) * 60ms);
  }

  .filter-radio {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
    padding: 0.4375rem 0.5rem;
    border-radius: var(--radius-sm);
    transition: background-color 160ms var(--ease-out), transform 160ms var(--ease-out);
  }
  .filter-radio:active {
    transform: scale(0.98);
  }
  @media (hover: hover) and (pointer: fine) {
    .filter-radio:hover {
      background-color: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
    }
  }

  .filter-radio input[type='radio'] {
    accent-color: var(--color-accent);
    width: 0.9375rem;
    height: 0.9375rem;
    flex-shrink: 0;
  }

  .filter-radio-label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    transition: color 160ms var(--ease-out);
  }
  .filter-radio-label.active {
    color: var(--color-text-primary);
    font-weight: 500;
  }
  @media (hover: hover) and (pointer: fine) {
    .filter-radio:hover .filter-radio-label {
      color: var(--color-text-primary);
    }
  }

  /* ─── Category pills ─── */
  .filter-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    animation: section-reveal 300ms var(--ease-out) both;
    animation-delay: calc(var(--stagger-index, 0) * 60ms);
  }

  .filter-pill {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    background-color: transparent;
    border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    border-radius: var(--radius-full);
    padding: 0.375rem 0.875rem;
    cursor: pointer;
    transition:
      background-color 200ms var(--ease-out),
      color 160ms var(--ease-out),
      border-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
    white-space: nowrap;
  }
  .filter-pill:active {
    transform: scale(0.96);
  }
  @media (hover: hover) and (pointer: fine) {
    .filter-pill:hover {
      color: var(--color-text-primary);
      border-color: var(--color-text-secondary);
    }
  }
  .filter-pill.active {
    background-color: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }
  @media (hover: hover) and (pointer: fine) {
    .filter-pill.active:hover {
      background-color: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
      color: var(--color-bg);
    }
  }

  /* ─── Price section ─── */
  .price-section {
    animation: section-reveal 300ms var(--ease-out) both;
    animation-delay: calc(var(--stagger-index, 0) * 60ms);
  }

  .price-range-display {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .price-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
  }

  .price-dash {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .price-inputs {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .price-field {
    flex: 1;
  }

  .price-label {
    display: block;
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.375rem;
    letter-spacing: 0.02em;
  }

  .price-input {
    width: 100%;
    background-color: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    outline: none;
    font-variant-numeric: tabular-nums;
    transition: border-color 160ms var(--ease-out), background-color 160ms var(--ease-out);
  }
  .price-input:focus {
    border-color: var(--color-accent);
    background-color: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  /* ─── Apply button ─── */
  .apply-btn {
    margin-top: 0.875rem;
    width: 100%;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-bg);
    background-color: var(--color-accent);
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition:
      background-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .apply-btn:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .apply-btn:hover {
      background-color: var(--color-accent-hover);
    }
  }

  /* ─── Reveal animation ─── */
  @keyframes section-reveal {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── Reduced motion ─── */
  @media (prefers-reduced-motion: reduce) {
    .filter-pill,
    .filter-radio,
    .filter-close-btn,
    .chevron,
    .apply-btn,
    .clear-all-btn {
      transition-duration: 0.01ms !important;
    }
    .filter-options,
    .filter-pills,
    .price-section {
      animation: none;
    }
  }
</style>