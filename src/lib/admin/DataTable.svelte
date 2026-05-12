<script lang="ts" generics="TData">
	import { createSvelteTable } from '$lib/components/ui/data-table/data-table.svelte';
	import FlexRender from '$lib/components/ui/data-table/flex-render.svelte';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
	} from '@tanstack/table-core';
	import * as Table from '$lib/components/ui/table/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeftIcon from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRightIcon from '@lucide/svelte/icons/chevrons-right';

	let {
		columns,
		data,
		pageSize = 10,
		searchPlaceholder = 'Filter...',
		searchColumn = '',
		emptyMessage = 'No results.',
		children,
	}: {
		columns: ColumnDef<TData, any>[];
		data: TData[];
		pageSize?: number;
		searchPlaceholder?: string;
		searchColumn?: string;
		emptyMessage?: string;
		children?: import('svelte').Snippet;
	} = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let globalFilter = $state('');

	const table = createSvelteTable({
		get data() { return data; },
		columns,
		get state() { return { sorting, columnFilters, columnVisibility }; },
		onSortingChange: (updater) => {
			if (typeof updater === 'function') sorting = updater(sorting);
			else sorting = updater;
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') columnFilters = updater(columnFilters);
			else columnFilters = updater;
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') columnVisibility = updater(columnVisibility);
			else columnVisibility = updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	$effect(() => {
		table.setPageSize(pageSize);
	});

	function onSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		globalFilter = value;
		if (searchColumn) {
			table.getColumn(searchColumn)?.setFilterValue(value);
		} else {
			for (const col of table.getAllColumns()) {
				if (col.getCanFilter()) {
					col.setFilterValue(value);
					break;
				}
			}
		}
	}

	let totalRows = $derived(table.getFilteredRowModel().rows.length);
	let pageIndex = $derived(table.getState().pagination.pageIndex);
	let pageCount = $derived(table.getPageCount());
</script>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<Input
			type="text"
			placeholder={searchPlaceholder}
			class="max-w-sm"
			oninput={onSearchInput}
		/>
		{#if children}
			<div class="ml-auto flex items-center gap-2">
				{@render children()}
			</div>
		{/if}
	</div>

	<div class="rounded-xl border border-border overflow-hidden">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row class="border-b border-border bg-muted/50 hover:bg-transparent">
						{#each headerGroup.headers as header}
							<Table.Head>
								{#if !header.isPlaceholder}
									{#if header.column.getCanSort()}
										<button
											class="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors"
											onclick={() => header.column.toggleSorting()}
										>
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
											{#if header.column.getIsSorted() === 'asc'}
												<span class="text-primary">&#9650;</span>
											{:else if header.column.getIsSorted() === 'desc'}
												<span class="text-primary">&#9660;</span>
											{/if}
										</button>
									{:else}
										<span class="text-xs font-medium text-muted-foreground uppercase">
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										</span>
									{/if}
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getRowModel().rows.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="py-12 text-center text-muted-foreground">
							{globalFilter ? 'No results for "' + globalFilter + '"' : emptyMessage}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each table.getRowModel().rows as row}
						<Table.Row
							class="border-b border-border/50 hover:bg-muted/50 transition-colors"
							data-state={row.getIsSelected() ? 'selected' : undefined}
						>
							{#each row.getVisibleCells() as cell}
								<Table.Cell>
									<FlexRender
										content={cell.column.columnDef.cell}
										context={cell.getContext()}
									/>
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	{#if pageCount > 1}
		<div class="flex items-center justify-between gap-4">
			<p class="text-sm text-muted-foreground">
				Showing {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}
			</p>
			<div class="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					disabled={!table.getCanPreviousPage()}
					onclick={() => table.setPageIndex(0)}
				>
					<ChevronsLeftIcon class="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					disabled={!table.getCanPreviousPage()}
					onclick={() => table.previousPage()}
				>
					<ChevronLeftIcon class="size-4" />
				</Button>
				<span class="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
					{pageIndex + 1} / {pageCount}
				</span>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					disabled={!table.getCanNextPage()}
					onclick={() => table.nextPage()}
				>
					<ChevronRightIcon class="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					disabled={!table.getCanNextPage()}
					onclick={() => table.setPageIndex(pageCount - 1)}
				>
					<ChevronsRightIcon class="size-4" />
				</Button>
			</div>
		</div>
	{/if}
</div>
