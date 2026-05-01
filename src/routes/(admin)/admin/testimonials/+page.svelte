<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let { data } = $props();

  let showForm = $state(false);
  let deleteId = $state('');
  let showDelete = $state(false);

  // Form state
  let isEdit = $state(false);
  let editId = $state('');
  let eName = $state(''); let eRole = $state(''); let eBody = $state(''); let eRating = $state('5'); let eSortOrder = $state('0'); let eActive = $state(true);

  function openCreate() {
    isEdit = false; editId = ''; eName = ''; eRole = ''; eBody = ''; eRating = '5'; eSortOrder = '0'; eActive = true;
    showForm = true;
  }

  function openEdit(t: {
    id: string; name: string; role: string; body: string; rating: number; active: boolean; sort_order: number;
  }) {
    isEdit = true; editId = t.id; eName = t.name; eRole = t.role; eBody = t.body; eRating = String(t.rating); eSortOrder = String(t.sort_order); eActive = t.active;
    showForm = true;
  }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Testimonials</h1>
    <Button onclick={openCreate} class="inline-flex items-center gap-1.5 bg-[#2997ff] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0a84ff] transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Testimonial
    </Button>
  </div>

  {#if data.testimonials.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No testimonials yet.</p>
    </div>
  {:else}
    <div class="grid gap-3">
      {#each data.testimonials as t}
        <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-4 flex items-start gap-4">
          {#if t.avatarUrl}
            <div class="w-12 h-12 rounded-full overflow-hidden bg-[#2d2d2f] shrink-0">
              <img src={t.avatarUrl} alt="" class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[#f5f5f7] font-medium text-sm">{t.name}</span>
              {#if t.role}
                <span class="text-xs text-[#86868b]">{t.role}</span>
              {/if}
              <Badge variant="outline" class={t.active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}>
                {t.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p class="text-sm text-[#86868b] mt-1 line-clamp-2">"{t.body}"</p>
            {#if t.rating > 0}
              <span class="text-xs text-[#ff9f0a] mt-0.5">{t.rating}/5</span>
            {/if}
          </div>
          <div class="flex items-center gap-2 shrink-0 text-xs">
            <Button variant="link" onclick={() => openEdit(t)} class="text-[#2997ff] hover:underline">Edit</Button>
            <Button variant="link" onclick={() => { deleteId = t.id; showDelete = true; }} class="text-[#ff453a] hover:underline">Delete</Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Form Modal -->
{#if showForm}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto" onclick={() => (showForm = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-lg mx-4 mb-16" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-5">{isEdit ? 'Edit Testimonial' : 'New Testimonial'}</h3>
      <form method="post" action="?/{isEdit ? 'update' : 'create'}" enctype="multipart/form-data" class="space-y-4">
        {#if isEdit}<input type="hidden" name="id" value={editId} />{/if}

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <Label class="text-sm text-[#86868b]">Name <span class="text-[#ff453a]">*</span></Label>
            <Input type="text" name="name" value={eName} oninput={(e) => (eName = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]" required />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label class="text-sm text-[#86868b]">Role</Label>
            <Input type="text" name="role" value={eRole} oninput={(e) => (eRole = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]" placeholder="CEO" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">Body <span class="text-[#ff453a]">*</span></Label>
          <textarea name="body" rows="3" class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] resize-y" required>{eBody}</textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <Label class="text-sm text-[#86868b]">Rating</Label>
            <Input type="number" name="rating" min="1" max="5" step="1" value={eRating} oninput={(e) => (eRating = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] w-24" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label class="text-sm text-[#86868b]">Sort Order</Label>
            <Input type="number" name="sort_order" min="0" value={eSortOrder} oninput={(e) => (eSortOrder = (e.target as HTMLInputElement).value)} class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#f5f5f7] focus:outline-none focus:border-[#2997ff] w-24" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label class="text-sm text-[#86868b]">{isEdit ? 'Replace Avatar' : 'Avatar'}</Label>
          <Input type="file" name="avatar" accept="image/*" class="px-4 py-2.5 rounded-xl bg-[#000] border border-[#424245] text-sm text-[#86868b] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-[#2997ff]/15 file:text-[#2997ff] file:border-0 hover:file:bg-[#2997ff]/25 file:transition-colors" />
        </div>

        <label class="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" name="active" checked={eActive} onchange={(e) => (eActive = (e.target as HTMLInputElement).checked)} class="w-4 h-4 rounded accent-[#2997ff]" />
          <span class="text-sm text-[#f5f5f7]">Active</span>
        </label>

        <div class="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onclick={() => (showForm = false)} class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f]">Cancel</Button>
          <Button type="submit" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#2997ff] hover:bg-[#0a84ff]">{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showDelete}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick={() => (showDelete = false)}>
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete Testimonial</h3>
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
