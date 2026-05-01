<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

  let { data } = $props();

  let showForm = $state(false);
  let editId = $state('');
  let editTitle = $state('');
  let editSubtitle = $state('');
  let editLinkUrl = $state('');
  let editSortOrder = $state('0');
  let editActive = $state(false);
  let isEdit = $state(false);

  let deleteId = $state('');
  let showDelete = $state(false);

  function openCreate() {
    isEdit = false;
    editId = '';
    editTitle = '';
    editSubtitle = '';
    editLinkUrl = '';
    editSortOrder = '0';
    editActive = true;
    showForm = true;
  }

  function openEdit(b: {
    id: string; title: string; subtitle: string; link_url: string; active: boolean; sort_order: number;
  }) {
    isEdit = true;
    editId = b.id;
    editTitle = b.title;
    editSubtitle = b.subtitle;
    editLinkUrl = b.link_url;
    editSortOrder = String(b.sort_order);
    editActive = b.active;
    showForm = true;
  }

  function closeForm() { showForm = false; }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Banners</h1>
    <Button onclick={openCreate} class="inline-flex items-center gap-1.5 bg-[#2997ff] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0a84ff] transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Banner
    </Button>
  </div>

  {#if data.banners.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No banners yet.</p>
    </div>
  {:else}
    <div class="grid gap-3">
      {#each data.banners as banner}
        <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-4 flex items-center gap-4">
          {#if banner.imageUrl}
            <div class="w-16 h-12 rounded-lg overflow-hidden bg-[#2d2d2f] shrink-0">
              <img src={banner.imageUrl} alt="" class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[#f5f5f7] font-medium text-sm truncate">{banner.title || 'Untitled'}</span>
              <Badge variant="outline" class={banner.active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}>
                {banner.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {#if banner.subtitle}
              <p class="text-xs text-[#86868b] truncate mt-0.5">{banner.subtitle}</p>
            {/if}
          </div>

          <div class="flex items-center gap-2 shrink-0 text-xs">
            <Button variant="link" onclick={() => openEdit(banner)} class="text-[#2997ff] hover:underline">Edit</Button>
            <Button variant="link" onclick={() => { deleteId = banner.id; showDelete = true; }} class="text-[#ff453a] hover:underline">Delete</Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Form Modal -->
{#if showForm}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-sm overflow-y-auto" onclick={closeForm}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-lg mx-4 mb-16" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-5">{isEdit ? 'Edit Banner' : 'New Banner'}</h3>

      <form method="post" action="?/{isEdit ? 'update' : 'create'}" enctype="multipart/form-data" class="space-y-4">
        {#if isEdit}
          <input type="hidden" name="id" value={editId} />
        {/if}

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">Title</Label>
          <Input type="text" name="title" value={editTitle} oninput={(e) => (editTitle = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">Subtitle</Label>
          <Input type="text" name="subtitle" value={editSubtitle} oninput={(e) => (editSubtitle = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">Link URL</Label>
          <Input type="text" name="link_url" value={editLinkUrl} oninput={(e) => (editLinkUrl = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] font-mono" placeholder="/products" />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">Sort Order</Label>
          <Input type="number" name="sort_order" min="0" value={editSortOrder} oninput={(e) => (editSortOrder = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] w-24" />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">{isEdit ? 'Replace Image' : 'Image'}</Label>
          <Input type="file" name="image" accept="image/*" class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#86868b] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-[#2997ff]/15 file:text-[#2997ff] file:border-0 hover:file:bg-[#2997ff]/25 file:transition-colors" />
        </div>

        <input type="hidden" name="active" value={String(editActive)} />
        <label class="flex items-center gap-2.5 cursor-pointer">
          <Checkbox bind:checked={editActive} />
          <span class="text-sm text-[#f5f5f7]">Active</span>
        </label>

        <div class="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onclick={closeForm} class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f]">Cancel</Button>
          <Button type="submit" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#2997ff] hover:bg-[#0a84ff]">
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showDelete}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick={() => (showDelete = false)}>
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete Banner</h3>
      <p class="text-[#86868b] text-sm mb-6">Are you sure?</p>
      <div class="flex justify-end gap-3">
        <Button variant="outline" class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f]" onclick={() => (showDelete = false)}>Cancel</Button>
        <form method="post" action="?/delete">
          <input type="hidden" name="id" value={deleteId} />
          <Button type="submit" variant="destructive" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56]">Delete</Button>
        </form>
      </div>
    </div>
  </div>
{/if}
