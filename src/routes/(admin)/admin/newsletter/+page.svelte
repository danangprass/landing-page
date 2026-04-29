<script lang="ts">
  let { data } = $props();

  let deleteId = $state('');
  let showDelete = $state(false);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Newsletter Subscribers</h1>
    <span class="text-sm text-[#86868b]">{data.subscribers.length} total</span>
  </div>

  {#if data.subscribers.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No subscribers yet.</p>
    </div>
  {:else}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#424245] bg-[#000]/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Email</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Subscribed</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.subscribers as sub}
              <tr class="border-b border-[#424245]/50 hover:bg-[#2d2d2f] transition-colors">
                <td class="px-4 py-3 text-[#f5f5f7] font-mono text-xs">{sub.email}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {sub.active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}">
                    {sub.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-4 py-3 text-[#86868b] whitespace-nowrap">{formatDate(sub.created)}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <form method="post" action="?/toggleActive" class="inline">
                      <input type="hidden" name="id" value={sub.id} />
                      <input type="hidden" name="active" value={String(sub.active)} />
                      <button type="submit" class="text-xs text-[#2997ff] hover:underline">
                        {sub.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
                    <button class="text-xs text-[#ff453a] hover:underline" onclick={() => { deleteId = sub.id; showDelete = true; }}>
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
  {/if}
</div>

{#if showDelete}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick={() => (showDelete = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete Subscriber</h3>
      <p class="text-[#86868b] text-sm mb-6">Permanently remove this subscriber?</p>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f]" onclick={() => (showDelete = false)}>Cancel</button>
        <form method="post" action="?/delete">
          <input type="hidden" name="id" value={deleteId} />
          <button type="submit" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56]">Delete</button>
        </form>
      </div>
    </div>
  </div>
{/if}
