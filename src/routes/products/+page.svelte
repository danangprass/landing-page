<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import { getProductsContext } from '$lib/stores/products.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import FilterSidebar from '$lib/components/FilterSidebar.svelte';
  import Breadcrumb from '$lib/components/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/components/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/components/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/components/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/components/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/components/ui/breadcrumb/breadcrumb-separator.svelte';
  import ListFilterIcon from '@lucide/svelte/icons/list-filter';

  const store = getProductsContext();

  let selectedCategory = $state(page.url.searchParams.get('category') ?? '');
  let searchQuery = $state(page.url.searchParams.get('search') ?? '');
  let sortBy: string = $state('featured');
  let priceRange: number[] = $state([0, 2000]);
  let mobileFilterOpen = $state(false);

  $effect(() => {
    const cat = page.url.searchParams.get('category') ?? '';
    if (cat !== untrack(() => selectedCategory)) {
      selectedCategory = cat;
    }
  });

  $effect(() => {
    const s = page.url.searchParams.get('search') ?? '';
    if (s !== untrack(() => searchQuery)) {
      searchQuery = s;
    }
  });

  afterNavigate(() => {
    const cat = page.url.searchParams.get('category') ?? '';
    const s = page.url.searchParams.get('search') ?? '';
    if (cat !== selectedCategory) selectedCategory = cat;
    if (s !== searchQuery) searchQuery = s;
  });

  $effect(() => {
    store.loadCategories();
  });

  $effect(() => {
    const category = selectedCategory || undefined;
    const search = searchQuery || undefined;
    const sort = sortBy || undefined;
    const min = priceRange[0] || undefined;
    const max = priceRange[1] < 2000 ? priceRange[1] : undefined;
    store.loadProducts({ category, search, sort, minPrice: min, maxPrice: max });
  });

  // Backend handles filtering and sorting; use store.products directly
  let filteredProducts = $derived(store.products);

  let hasActiveFilters = $derived(
    selectedCategory !== '' || searchQuery !== '' || sortBy !== 'featured' || priceRange[0] !== 0 || priceRange[1] !== 2000
  );

  function handleCategoryChange(cat: string) {
    selectedCategory = cat;
    mobileFilterOpen = false;
    const url = new URL(page.url);
    if (cat) url.searchParams.set('category', cat);
    else url.searchParams.delete('category');
    window.history.replaceState({}, '', url.pathname + url.search);
    // Ensure products reload immediately on category change
    store.loadProducts({ category: cat || undefined, search: searchQuery || undefined });
  }

  function handleSortChange(sort: string) { sortBy = sort; }
  function handlePriceChange(range: number[]) { priceRange = range; }

  function handleClearAll() {
    sortBy = 'featured';
    priceRange = [0, 2000];
    searchQuery = '';
    handleCategoryChange('');
    const url = new URL(page.url);
    url.searchParams.delete('search');
    window.history.replaceState({}, '', url.pathname + url.search);
  }

  $effect(() => {
    // Re-run when products change so newly added .reveal elements get observed
    filteredProducts;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>All Products | ElectraStore</title>
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
          <BreadcrumbPage>Products</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex items-end justify-between py-8 border-b border-border">
    <div>
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">All Products</h1>
      <p class="mt-2 text-text-secondary text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
    </div>
    <Button class="md:hidden flex items-center gap-2" onclick={() => (mobileFilterOpen = true)}>
      <ListFilterIcon class="size-4" />
      Filter
    </Button>
  </div>

  <div class="flex gap-8 py-8">
    <!-- Single FilterSidebar: desktop sticky sidebar, mobile bottom-sheet drawer -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <aside
      class="filter-aside w-[280px] shrink-0 sticky top-24 self-start"
      class:filter-aside-open={mobileFilterOpen}
      aria-label="Filters"
    >
      <FilterSidebar
        {selectedCategory} {sortBy} {priceRange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onPriceChange={handlePriceChange}
        onClose={() => (mobileFilterOpen = false)}
        onClearAll={handleClearAll}
      />
    </aside>
    <div class="flex-1 min-w-0">
      {#if filteredProducts.length === 0 && !store.loading}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <p class="text-text-secondary text-lg">
            {searchQuery ? `No products found matching "${searchQuery}".` : 'No products match your filters.'}
          </p>
          <button class="mt-4 text-accent text-sm" onclick={handleClearAll}>Clear all filters</button>
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 stagger">
          {#each filteredProducts as product, i (product.id)}
            <div class="reveal" style="--stagger-index: {i}">
              <ProductCard product={product} category={product.expand?.category} />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Mobile backdrop overlay -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="drawer-overlay" class:drawer-overlay-visible={mobileFilterOpen} onclick={() => (mobileFilterOpen = false)} role="presentation"></div>

<style>
  .filter-toggle { transition: transform 160ms var(--ease-out); }
  .filter-toggle:active { transform: scale(0.97); }

  /* Mobile backdrop overlay */
  .drawer-overlay { position: fixed; inset: 0; z-index: 40; background-color: rgba(0,0,0,0); pointer-events: none; transition: background-color 400ms var(--ease-out); }
  .drawer-overlay-visible { background-color: rgba(0,0,0,0.6); backdrop-filter: blur(4px); pointer-events: auto; }

  /* Mobile: filter aside becomes a bottom-sheet drawer */
  @media (max-width: 767px) {
    .filter-aside {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      max-height: 85vh;
      overflow-y: auto;
      width: 100% !important;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      border-top: 1px solid var(--color-border);
      background-color: var(--color-surface);
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
      transition: transform 500ms var(--ease-drawer), opacity 400ms var(--ease-out);
    }

    .filter-aside-open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Desktop: always visible sidebar */
  @media (min-width: 768px) {
    .filter-aside {
      transform: none;
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer-overlay, .filter-aside { transition-duration: 0.01ms !important; }
  }
</style>