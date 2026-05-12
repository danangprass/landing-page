<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
  import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem } from '$lib/components/ui/select/index.js';

  let { data, form } = $props();

  let slug = $state('');
  let nameValue = $state('');
  let category = $state(form?.values?.category ?? '');
  let featured = $state(form?.values?.featured ?? false);
  let active = $state(form?.values?.active ?? true);

  let categoryLabel = $derived(category ? (data.categories as unknown as {id: string; name: string}[]).find((c) => c.id === category)?.name ?? 'Select category...' : 'Select category...');

  function generateSlug(v: string) {
    nameValue = v;
    slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/products" class="text-muted-foreground hover:text-foreground transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-foreground">New Product</h1>
  </div>

  <form method="post" action="?/create" enctype="multipart/form-data" class="max-w-2xl space-y-5">
    {#if form?.error}
      <div class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{form.error}</div>
    {/if}

    <!-- Name -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">
        Name <span class="text-destructive">*</span>
      </Label>
      <Input
        type="text"
        name="name"
        required
        value={form?.values?.name ?? nameValue}
        oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
        placeholder="Product name"
      />
    </div>

    <!-- Slug -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">
        Slug <span class="text-destructive">*</span>
      </Label>
      <Input
        type="text"
        name="slug"
        required
        value={form?.values?.slug ?? slug}
        oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
        placeholder="product-slug"
      />
    </div>

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Description</Label>
      <textarea
        name="description"
        rows="4"
        value={form?.values?.description ?? ''}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-y"
        placeholder="Product description..."
      ></textarea>
    </div>

    <!-- Price + Compare-at -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-foreground">
          Price <span class="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          name="price"
          required
          step="0.01"
          min="0"
          value={form?.values?.price ?? ''}
          class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="0.00"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-foreground">Compare-at Price</Label>
        <Input
          type="number"
          name="compare_at_price"
          step="0.01"
          min="0"
          value={form?.values?.compareAtPrice ?? ''}
          class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="0.00"
        />
      </div>
    </div>

    <!-- Category -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">
        Category <span class="text-destructive">*</span>
      </Label>
      <input type="hidden" name="category" value={category} />
      <Select type="single" bind:value={category} required>
        <SelectTrigger class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors w-full">
          {categoryLabel}
        </SelectTrigger>
        <SelectContent class="bg-background border border-border rounded-xl text-sm text-foreground">
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
        <Label class="text-sm font-medium text-foreground">Stock</Label>
        <Input
          type="number"
          name="stock"
          min="0"
          value={form?.values?.stock ?? ''}
          class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="0"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label class="text-sm font-medium text-foreground">SKU</Label>
        <Input
          type="text"
          name="sku"
          value={form?.values?.sku ?? ''}
          class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
          placeholder="SKU-001"
        />
      </div>
    </div>

    <!-- Images -->
    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Images</Label>
      <Input
        type="file"
        name="images"
        multiple
        accept="image/*"
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20 file:transition-colors file:cursor-pointer"
      />
    </div>

    <!-- Toggles -->
    <input type="hidden" name="featured" value={String(featured)} />
    <input type="hidden" name="active" value={String(active)} />
    <div class="flex items-center gap-8">
      <label class="flex items-center gap-2.5 cursor-pointer">
        <Checkbox bind:checked={featured} />
        <span class="text-sm text-foreground">Featured</span>
      </label>
      <label class="flex items-center gap-2.5 cursor-pointer">
        <Checkbox bind:checked={active} />
        <span class="text-sm text-foreground">Active</span>
      </label>
    </div>

    <!-- Submit -->
    <div class="flex items-center gap-3 pt-2">
      <Button
        type="submit"
        class="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Create Product
      </Button>
      <Button
        variant="outline"
        href="/admin/products"
        class="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        Cancel
      </Button>
    </div>
  </form>
</div>
