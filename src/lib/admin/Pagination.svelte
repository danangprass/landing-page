<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';

  let { page = 1, totalPages = 1, onPage = (_p: number) => {} }: {
    page?: number;
    totalPages?: number;
    onPage?: (page: number) => void;
  } = $props();

  let pages = $derived.by<number[]>(() => {
    const result: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  });
</script>

{#if totalPages > 1}
  <nav class="flex items-center gap-1" aria-label="Pagination">
    <Button
      variant="ghost"
      class="px-3 py-2 rounded-lg text-sm text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page <= 1}
      onclick={() => onPage(page - 1)}
    >
      Prev
    </Button>

    {#each pages as p}
      <Button
        variant="ghost"
        class="min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors {p === page ? 'bg-[#2997ff] text-white' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
        onclick={() => onPage(p)}
      >
        {p}
      </Button>
    {/each}

    <Button
      variant="ghost"
      class="px-3 py-2 rounded-lg text-sm text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page >= totalPages}
      onclick={() => onPage(page + 1)}
    >
      Next
    </Button>
  </nav>
{/if}
