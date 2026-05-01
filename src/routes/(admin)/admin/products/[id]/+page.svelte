<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
  import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem } from '$lib/components/ui/select/index.js';

  let { data, form } = $props();

  let slug = $state(data.product.slug);
  let nameValue = $state(data.product.name);
  let category = $state(data.product.category);
  let featured = $state(data.product.featured);
  let active = $state(data.product.active);

  let categoryLabel = $derived(category ? (data.categories as unknown as {id: string; name: string}[]).find((c) => c.id === category)?.name ?? 'Select category...' : 'Select category...');

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
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Edit Product</h1>
  </div>

  <form method="post" action="?/update" enctype="multipart/form-data" class="max-w-2xl space-y-5">
    {#if form?.error}
      <div class="px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm">{form.error}</div>
    {/if}

    <!-- Name -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-[#f5f5f7]">
        Name <span class="text-[#ff453a]">*</span>
      </Label>
      <Input
        type="text"
        name="name"
        required
        value={nameValue}
        oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
      />
    </div>

    <!-- Slug -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-[#f5f5f7]">
        Slug <span class="text-[#ff453a]">*</span>
      </Label>
      <Input
        type="text"
        name="slug"
        required
        value={slug}
        oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors font-mono"
      />
    </div>

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-[#f5f5f7]">Description</Label>
      <textarea
        name="description"
        rows="4"
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors resize-y"
      >{data.product.description ?? ''}</textarea>
    </div>

    <!-- Price + Compare-at -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-[#f5f5f7]">
          Price <span class="text-[#ff453a]">*</span>
        </Label>
        <Input
          type="number"
          name="price"
          required
          step="0.01"
          min="0"
          value={data.product.price}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-[#f5f5f7]">Compare-at Price</Label>
        <Input
          type="number"
          name="compare_at_price"
          step="0.01"
          min="0"
          value={data.product.compare_at_price ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
        />
      </div>
    </div>

    <!-- Category -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-[#f5f5f7]">
        Category <span class="text-[#ff453a]">*</span>
      </Label>
      <input type="hidden" name="category" value={category} />
      <Select type="single" bind:value={category} required>
        <SelectTrigger class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors w-full">
          {categoryLabel}
        </SelectTrigger>
        <SelectContent class="bg-[#1d1d1f] border border-[#424245] rounded-xl text-sm text-[#f5f5f7]">
          <SelectGroup>
            {#each data.categories as cat}
              <SelectItem value={cat.id}>{cat.name}</SelectItem>
            {/each}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <!-- Stock + SKU -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-[#f5f5f7]">Stock</Label>
        <Input
          type="number"
          name="stock"
          min="0"
          value={data.product.stock ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-[#f5f5f7]">SKU</Label>
        <Input
          type="text"
          name="sku"
          value={data.product.sku ?? ''}
          class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] transition-colors font-mono"
        />
      </div>
    </div>

    <!-- Current images -->
    {#if data.product.imageUrls.length > 0}
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-[#f5f5f7]">Current Images</Label>
        <div class="flex flex-wrap gap-2">
          {#each data.product.imageUrls as url}
            <div class="w-20 h-20 rounded-lg overflow-hidden bg-[#2d2d2f] border border-[#424245]">
              <img src={url} alt="" class="w-full h-full object-cover" />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- New Images -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-[#f5f5f7]">Add Images (replaces existing)</Label>
      <Input
        type="file"
        name="images"
        multiple
        accept="image/*"
        class="px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#86868b] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-[#2997ff]/15 file:text-[#2997ff] file:border-0 hover:file:bg-[#2997ff]/25 file:transition-colors file:cursor-pointer"
      />
    </div>

    <!-- Toggles -->
    <input type="hidden" name="featured" value={String(featured)} />
    <input type="hidden" name="active" value={String(active)} />
    <div class="flex items-center gap-8">
      <label class="flex items-center gap-2.5 cursor-pointer">
        <Checkbox bind:checked={featured} />
        <span class="text-sm text-[#f5f5f7]">Featured</span>
      </label>
      <label class="flex items-center gap-2.5 cursor-pointer">
        <Checkbox bind:checked={active} />
        <span class="text-sm text-[#f5f5f7]">Active</span>
      </label>
    </div>

    <!-- Submit -->
    <div class="flex items-center gap-3 pt-2">
      <Button
        type="submit"
        class="px-6 py-2.5 rounded-xl bg-[#2997ff] text-white text-sm font-medium hover:bg-[#0a84ff] transition-colors"
      >
        Save Changes
      </Button>
      <Button
        variant="outline"
        href="/admin/products"
        class="px-4 py-2.5 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] transition-colors"
      >
        Cancel
      </Button>
    </div>
  </form>
</div>
