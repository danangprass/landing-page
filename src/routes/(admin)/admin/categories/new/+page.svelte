<script lang="ts">
  let { form } = $props();

  let slug = $state('');
  let nameValue = $state('');

  function generateSlug(v: string) {
    nameValue = v;
    slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/categories" class="text-[#86868b] hover:text-[#f5f5f7]">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">New Category</h1>
  </div>

  <form method="post" action="?/create" enctype="multipart/form-data" class="max-w-lg space-y-5">
    {#if form?.error}
      <div class="px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm">{form.error}</div>
    {/if}

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Name <span class="text-[#ff453a]">*</span></label>
      <input
        type="text" name="name" required
        value={form?.values?.name ?? nameValue}
        oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
        placeholder="Category name"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Slug <span class="text-[#ff453a]">*</span></label>
      <input
        type="text" name="slug" required
        value={form?.values?.slug ?? slug}
        oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] font-mono"
        placeholder="category-slug"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Description</label>
      <textarea
        name="description" rows="3"
        value={form?.values?.description ?? ''}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] resize-y"
        placeholder="Brief category description..."
      ></textarea>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Sort Order</label>
      <input
        type="number" name="sort_order" min="0"
        value={form?.values?.sort_order ?? '0'}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] w-24"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-[#f5f5f7]">Image</label>
      <input
        type="file" name="image" accept="image/*"
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#86868b] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-[#2997ff]/15 file:text-[#2997ff] file:border-0 hover:file:bg-[#2997ff]/25 file:transition-colors"
      />
    </div>

    <label class="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" name="active" checked={form?.values?.active ?? true} class="w-4 h-4 rounded accent-[#2997ff]" />
      <span class="text-sm text-[#f5f5f7]">Active</span>
    </label>

    <div class="flex items-center gap-3 pt-2">
      <button type="submit" class="px-6 py-2.5 rounded-xl bg-[#2997ff] text-white text-sm font-medium hover:bg-[#0a84ff] transition-colors">
        Create Category
      </button>
      <a href="/admin/categories" class="px-4 py-2.5 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] transition-colors">
        Cancel
      </a>
    </div>
  </form>
</div>
