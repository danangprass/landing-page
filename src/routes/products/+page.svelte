<script lang="ts">
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import { getProductsContext } from '$lib/stores/products.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import FilterSidebar from '$lib/components/FilterSidebar.svelte';

  const store = getProductsContext();

  let selectedCategory = $state(page.url.searchParams.get('category') ?? '');
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
    store.loadCategories();
  });

  $effect(() => {
    store.loadProducts({ category: selectedCategory || undefined });
  });

  let filteredProducts = $derived(store.products);

  let hasActiveFilters = $derived(
    selectedCategory !== '' || sortBy !== 'featured' || priceRange[0] !== 0 || priceRange[1] !== 2000
  );

  function handleCategoryChange(cat: string) {
    selectedCategory = cat;
    mobileFilterOpen = false;
    const url = new URL(page.url);
    if (cat) url.searchParams.set('category', cat);
    else url.searchParams.delete('category');
    window.history.replaceState({}, '', url.pathname + url.search);
    // Ensure products reload immediately on category change
    store.loadProducts({ category: cat || undefined });
  }

  function handleSortChange(sort: string) { sortBy = sort; }
  function handlePriceChange(range: number[]) { priceRange = range; }

  function handleClearAll() {
    sortBy = 'featured';
    priceRange = [0, 2000];
    handleCategoryChange('');
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
  <nav class="py-4 text-sm text-text-secondary" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2">
      <li><a href="/" class="hover:text-text-primary">Home</a></li>
      <li><span class="text-text-secondary/50">/</span></li>
      <li class="text-text-primary">Products</li>
    </ol>
  </nav>

  <div class="flex items-end justify-between py-8 border-b border-border">
    <div>
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">All Products</h1>
      <p class="mt-2 text-text-secondary text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
    </div>
    <button class="md:hidden filter-toggle btn-primary !px-4 !py-2 text-sm flex items-center gap-2" onclick={() => (mobileFilterOpen = true)}>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
      Filter
    </button>
  </div>

  <div class="flex gap-8 py-8">
    <aside class="hidden md:block w-[280px] shrink-0 sticky top-24 self-start">
      <FilterSidebar {selectedCategory} {sortBy} {priceRange} onCategoryChange={handleCategoryChange} onSortChange={handleSortChange} onPriceChange={handlePriceChange} onClearAll={handleClearAll} />
    </aside>
    <div class="flex-1 min-w-0">
      {#if filteredProducts.length === 0 && !store.loading}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <p class="text-text-secondary text-lg">No products match your filters.</p>
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="drawer-overlay" class:drawer-overlay-visible={mobileFilterOpen} onclick={() => (mobileFilterOpen = false)} role="presentation"></div>
<div class="drawer-sheet" class:drawer-sheet-open={mobileFilterOpen}>
  <div class="p-6">
    <FilterSidebar {selectedCategory} {sortBy} {priceRange} onCategoryChange={handleCategoryChange} onSortChange={handleSortChange} onPriceChange={handlePriceChange} onClose={() => (mobileFilterOpen = false)} onClearAll={() => { handleClearAll(); mobileFilterOpen = false; }} />
  </div>
</div>

<style>
  .filter-toggle { transition: transform 160ms var(--ease-out); }
  .filter-toggle:active { transform: scale(0.97); }
  .drawer-overlay { position: fixed; inset: 0; z-index: 40; background-color: rgba(0,0,0,0); pointer-events: none; transition: background-color 400ms var(--ease-out); }
  .drawer-overlay-visible { background-color: rgba(0,0,0,0.6); backdrop-filter: blur(4px); pointer-events: auto; }
  .drawer-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; max-height: 85vh; overflow-y: auto; border-radius: var(--radius-lg) var(--radius-lg) 0 0; border-top: 1px solid var(--color-border); background-color: var(--color-surface); transform: translateY(100%); opacity: 0; pointer-events: none; transition: transform 500ms var(--ease-drawer), opacity 400ms var(--ease-out); }
  .drawer-sheet-open { transform: translateY(0); opacity: 1; pointer-events: auto; }
  @media (prefers-reduced-motion: reduce) { .drawer-overlay, .drawer-sheet { transition-duration: 0.01ms !important; } }
</style>