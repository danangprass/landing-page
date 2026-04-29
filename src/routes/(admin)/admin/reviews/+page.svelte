<script lang="ts">
  let { data } = $props();

  let deleteId = $state('');
  let showDelete = $state(false);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div>
  <h1 class="text-2xl font-semibold text-[#f5f5f7] mb-6">Reviews</h1>

  {#if data.reviews.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No reviews yet.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.reviews as review}
        <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[#f5f5f7] font-medium text-sm">{review.title || 'No title'}</span>
                <span class="text-[#ff9f0a] text-xs">{Array(review.rating).fill('*').join('')}</span>
                <span class="text-[#86868b] text-xs">{review.rating}/5</span>
              </div>
              <p class="text-sm text-[#86868b] line-clamp-2">{review.body}</p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-[#86868b]">by {review.userName}</span>
                <span class="text-xs text-[#86868b]">on {review.productName}</span>
                <span class="text-xs text-[#86868b]">{formatDate(review.created)}</span>
              </div>
            </div>
            <button
              class="text-xs text-[#ff453a] hover:underline shrink-0"
              onclick={() => { deleteId = review.id; showDelete = true; }}
            >
              Remove
            </button>
          </div>
        </div>
      {/each}
    </div>

    {#if data.totalPages > 1}
      <div class="flex items-center justify-center gap-2 mt-6">
        {#each Array(data.totalPages) as _, i}
          <a
            href="/admin/reviews?page={i + 1}"
            class="min-w-[36px] h-9 rounded-lg text-sm font-medium flex items-center justify-center {data.page === i + 1 ? 'bg-[#2997ff] text-white' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
          >
            {i + 1}
          </a>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if showDelete}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick={() => (showDelete = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4" onclick={(e: MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Remove Review</h3>
      <p class="text-[#86868b] text-sm mb-6">This review will be permanently deleted.</p>
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
