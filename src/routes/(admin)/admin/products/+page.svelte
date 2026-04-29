<script lang="ts">
  let { data, form } = $props();

  let deleteId = $state('');
  let showConfirm = $state(false);

  const formatPrice = (c: number) => '$' + c.toLocaleString('en-US');
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Products</h1>
    <a
      href="/admin/products/new"
      class="inline-flex items-center gap-1.5 bg-[#2997ff] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0a84ff] transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Product
    </a>
  </div>

  {#if data.products.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No products yet.</p>
      <a href="/admin/products/new" class="text-[#2997ff] text-sm hover:underline mt-1 inline-block">Create your first product</a>
    </div>
  {:else}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#424245] bg-[#000]/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Product</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Category</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Price</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Featured</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Active</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.products as product}
              <tr class="border-b border-[#424245]/50 hover:bg-[#2d2d2f] transition-colors">
                <td class="px-4 py-3">
                  <a href="/products/{product.slug}" class="text-[#f5f5f7] hover:text-[#2997ff] transition-colors font-medium">{product.name}</a>
                </td>
                <td class="px-4 py-3 text-[#86868b]">{product.categoryName}</td>
                <td class="px-4 py-3 text-right text-[#f5f5f7] font-medium">{formatPrice(product.price)}</td>
                <td class="px-4 py-3 text-right">
                  <span class:stock-low={Number(product.stock) < 5}>{product.stock ?? '-'}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {product.featured ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}">
                    {product.featured ? 'Yes' : 'No'}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {product.active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}">
                    {product.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/admin/products/{product.id}" class="text-[#2997ff] text-xs hover:underline">Edit</a>
                    <button
                      class="text-[#ff453a] text-xs hover:underline"
                      onclick={() => { deleteId = product.id; showConfirm = true; }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    {#if data.totalPages > 1}
      <div class="flex items-center justify-center gap-2 mt-6">
        {#each Array(data.totalPages) as _, i}
          <a
            href="/admin/products?page={i + 1}"
            class="min-w-[36px] h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors {data.page === i + 1 ? 'bg-[#2997ff] text-white' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
          >
            {i + 1}
          </a>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showConfirm}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={() => (showConfirm = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete Product</h3>
      <p class="text-[#86868b] text-sm mb-6">Are you sure? This cannot be undone.</p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f] transition-colors"
          onclick={() => (showConfirm = false)}
        >
          Cancel
        </button>
        <form method="post" action="?/delete">
          <input type="hidden" name="id" value={deleteId} />
          <button
            type="submit"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56] transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
