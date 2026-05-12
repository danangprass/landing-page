<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import Table from '$lib/components/ui/table/table.svelte';
  import TableHeader from '$lib/components/ui/table/table-header.svelte';
  import TableBody from '$lib/components/ui/table/table-body.svelte';
  import TableRow from '$lib/components/ui/table/table-row.svelte';
  import TableHead from '$lib/components/ui/table/table-head.svelte';
  import TableCell from '$lib/components/ui/table/table-cell.svelte';

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
    <Input
      type="text"
      placeholder="Search..."
      bind:value={search}
      class="w-full max-w-xs"
    />
  </div>

  <div class="overflow-x-auto rounded-xl border border-border">
    <Table class="w-full">
      <TableHeader>
        <TableRow class="border-b border-border bg-background hover:bg-transparent">
          {#each columns as col}
            <TableHead class="text-muted-foreground">
              {#if col.sortable !== false}
                <button
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {#if sortKey === col.key}
                    <span class="text-primary">{sortDir === 'asc' ? '^' : 'v'}</span>
                  {/if}
                </button>
              {:else}
                {col.label}
              {/if}
            </TableHead>
          {/each}
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if filtered.length === 0}
          <TableRow>
            <TableCell colspan={columns.length} class="py-12 text-center text-muted-foreground">
              {search.trim() ? 'No results for "' + search + '"' : emptyMessage}
            </TableCell>
          </TableRow>
        {:else}
          {#each filtered as row, i (row['id'] ?? i)}
            <TableRow
              class="border-b border-border/50 {i % 2 === 0 ? 'bg-transparent' : 'bg-muted/50'} hover:bg-muted {onRowClick ? 'cursor-pointer' : ''}"
              onclick={() => onRowClick?.(row)}
            >
              {#each columns as col}
                <TableCell class="text-foreground">
                  {String(row[col.key] ?? '')}
                </TableCell>
              {/each}
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>
{:else}
  <p class="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
{/if}
