<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

  let { form } = $props();

  let slug = $state('');
  let nameValue = $state('');
  let active = $state(form?.values?.active ?? true);

  function generateSlug(v: string) {
    nameValue = v;
    slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/categories" class="text-muted-foreground hover:text-foreground">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-foreground">New Category</h1>
  </div>

  <form method="post" action="?/create" enctype="multipart/form-data" class="max-w-lg space-y-5">
    {#if form?.error}
      <div class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{form.error}</div>
    {/if}

    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Name <span class="text-destructive">*</span></Label>
      <Input
        type="text" name="name" required
        value={form?.values?.name ?? nameValue}
        oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
        placeholder="Category name"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Slug <span class="text-destructive">*</span></Label>
      <Input
        type="text" name="slug" required
        value={form?.values?.slug ?? slug}
        oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary font-mono"
        placeholder="category-slug"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Description</Label>
      <textarea
        name="description" rows="3"
        value={form?.values?.description ?? ''}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary resize-y"
        placeholder="Brief category description..."
      ></textarea>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Sort Order</Label>
      <Input
        type="number" name="sort_order" min="0"
        value={form?.values?.sort_order ?? '0'}
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary w-24"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label class="text-sm font-medium text-foreground">Image</Label>
      <Input
        type="file" name="image" accept="image/*"
        class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20 file:transition-colors"
      />
    </div>

    <input type="hidden" name="active" value={String(active)} />
    <label class="flex items-center gap-2.5 cursor-pointer">
      <Checkbox bind:checked={active} />
      <span class="text-sm text-foreground">Active</span>
    </label>

    <div class="flex items-center gap-3 pt-2">
      <Button type="submit" class="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
        Create Category
      </Button>
      <Button variant="outline" href="/admin/categories" class="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        Cancel
      </Button>
    </div>
  </form>
</div>
