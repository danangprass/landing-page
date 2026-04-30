<script lang="ts">
  let {
    columns = [] as { key: string; label: string; sortable?: boolean }[],
    rows = [] as Record<string, unknown>[],
    emptyMessage = 'No data found.',
    onRowClick = undefined as ((row: Record<string, unknown>) => void) | undefined,
  }: {
    columns: { key: string; label: string; sortable?: boolean }[];
    rows: Record<string, unknown>[];
    emptyMessage?: string;
    onRowClick?: ((row: Record<string, unknown>) => void) | undefined;
  } = $props();

  let sortKey = $state('');
  let sortDir = $state<'asc' | 'desc'>('asc');
  let search = $state('');

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }

  let filtered = $derived.by(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = String(a[sortKey] ?? '').toLowerCase();
        const vb = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return result;
  });
</script>

{#if columns.length > 0}
  <div class="mb-4">
    <input
      type="text"
      placeholder="Search..."
      bind:value={search}
      class="w-full max-w-xs px-4 py-2 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors"
    />
  </div>

  <div class="overflow-x-auto rounded-xl border border-[#424245]">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-[#424245] bg-[#1d1d1f]">
          {#each columns as col}
            <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
              {#if col.sortable !== false}
                <button
                  class="flex items-center gap-1 hover:text-[#f5f5f7] transition-colors"
                  onclick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {#if sortKey === col.key}
                    <span class="text-[#2997ff]">{sortDir === 'asc' ? '^' : 'v'}</span>
                  {/if}
                </button>
              {:else}
                {col.label}
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if filtered.length === 0}
          <tr>
            <td colspan={columns.length} class="px-4 py-12 text-center text-[#86868b]">
              {search.trim() ? 'No results for "' + search + '"' : emptyMessage}
            </td>
          </tr>
        {:else}
          {#each filtered as row, i (row['id'] ?? i)}
            <tr
              class="border-b border-[#424245]/50 {i % 2 === 0 ? 'bg-transparent' : 'bg-[#1d1d1f]/50'} hover:bg-[#2d2d2f] transition-colors {onRowClick ? 'cursor-pointer' : ''}"
              onclick={() => onRowClick?.(row)}
            >
              {#each columns as col}
                <td class="px-4 py-3 text-[#f5f5f7]">
                  {String(row[col.key] ?? '')}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
{:else}
  <p class="text-sm text-[#86868b] text-center py-8">{emptyMessage}</p>
{/if}
