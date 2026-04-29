<script lang="ts">
  let { data, form } = $props();

  let slug = $state('');
  let nameValue = $state('');

  function generateSlug(v: string) {
    nameValue = v;
    slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/products" class="text-[#86868b] hover:text-[#f5f5f7] transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">New Product</h1>
  </div>

  <form method="post" action="?/create" enctype="multipart/form-data" class="max-w-2xl space-y-5">
    {#if form?.error}
      <div class="px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm">{form.error}</div>
    {/if}

    <!-- Name -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">
        Name <span class="text-[#ff453a]">*</span>
      </label>
      <input
        type="text"
        name="name"
        required
        value={form?.values?.name ?? nameValue}
        oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors"
        placeholder="Product name"
      />
    </div>

    <!-- Slug -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">
        Slug <span class="text-[#ff453a]">*</span>
      </label>
      <input
        type="text"
        name="slug"
        required
        value={form?.values?.slug ?? slug}
        oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors font-mono"
        placeholder="product-slug"
      />
    </div>

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Description</label>
      <textarea
        name="description"
        rows="4"
        value={form?.values?.description ?? ''}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors resize-y"
        placeholder="Product description..."
      ></textarea>
    </div>

    <!-- Price + Compare-at -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[#f5f5f7]">
          Price <span class="text-[#ff453a]">*</span>
        </label>
        <input
          type="number"
          name="price"
          required
          step="0.01"
          min="0"
          value={form?.values?.price ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
          placeholder="0.00"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[#f5f5f7]">Compare-at Price</label>
        <input
          type="number"
          name="compare_at_price"
          step="0.01"
          min="0"
          value={form?.values?.compareAtPrice ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
          placeholder="0.00"
        />
      </div>
    </div>

    <!-- Category -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">
        Category <span class="text-[#ff453a]">*</span>
      </label>
      <select
        name="category"
        required
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
      >
        <option value="">Select category...</option>
        {#each data.categories as cat}
          <option value={cat.id} selected={form?.values?.category === cat.id}>{cat.name}</option>
        {/each}
      </select>
    </div>

    <!-- Stock + SKU -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[#f5f5f7]">Stock</label>
        <input
          type="number"
          name="stock"
          min="0"
          value={form?.values?.stock ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
          placeholder="0"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[#f5f5f7]">SKU</label>
        <input
          type="text"
          name="sku"
          value={form?.values?.sku ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors font-mono"
          placeholder="SKU-001"
        />
      </div>
    </div>

    <!-- Images -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Images</label>
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#86868b] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-[#2997ff]/15 file:text-[#2997ff] file:border-0 hover:file:bg-[#2997ff]/25 file:transition-colors file:cursor-pointer"
      />
    </div>

    <!-- Toggles -->
    <div class="flex items-center gap-8">
      <label class="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" name="featured" checked={form?.values?.featured ?? false} class="w-4 h-4 rounded accent-[#2997ff]" />
        <span class="text-sm text-[#f5f5f7]">Featured</span>
      </label>
      <label class="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" name="active" checked={form?.values?.active ?? true} class="w-4 h-4 rounded accent-[#2997ff]" />
        <span class="text-sm text-[#f5f5f7]">Active</span>
      </label>
    </div>

    <!-- Submit -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        class="px-6 py-2.5 rounded-xl bg-[#2997ff] text-white text-sm font-medium hover:bg-[#0a84ff] transition-colors"
      >
        Create Product
      </button>
      <a
        href="/admin/products"
        class="px-4 py-2.5 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] transition-colors"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
