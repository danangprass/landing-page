<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import RowActions from '$lib/admin/RowActions.svelte';
	import { formatCurrency } from '$lib/admin/column-helpers';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data } = $props();

	let deleteId = $state('');
	let showConfirm = $state(false);

	type ProductRow = { id: string; slug: string; name: string; price: number; stock: number; featured: boolean; active: boolean; categoryName: string };

	const ch = createColumnHelper<ProductRow>();
	const columns = [
		ch.accessor('name', {
			header: 'Product',
			cell: (ctx) => {
				const row = ctx.row.original;
				return `<a href="/products/${row.slug}" class="text-foreground hover:text-primary transition-colors font-medium">${row.name}</a>`;
			},
		}),
		ch.accessor('categoryName', { header: 'Category' }),
		ch.accessor('price', {
			header: 'Price',
			cell: (ctx) => formatCurrency(ctx.getValue()),
		}),
		ch.accessor('stock', {
			header: 'Stock',
			cell: (ctx) => {
				const v = ctx.getValue();
				return v < 5 ? `<span class="text-destructive font-medium">${v ?? '-'}</span>` : String(v ?? '-');
			},
		}),
		ch.accessor('featured', {
			header: 'Featured',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: ctx.getValue() ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200', children: ctx.getValue() ? 'Yes' : 'No' },
			}),
		}),
		ch.accessor('active', {
			header: 'Active',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: ctx.getValue() ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200', children: ctx.getValue() ? 'Yes' : 'No' },
			}),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: RowActions,
				props: {
					editHref: `/admin/products/${ctx.row.original.id}`,
					itemId: ctx.row.original.id,
					ondelete: (id: string) => { deleteId = id; showConfirm = true; },
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Products</h1>
		<Button href="/admin/products/new">
			<PlusIcon class="size-4" />
			New Product
		</Button>
	</div>

	<DataTable
		columns={columns}
		data={data.products as ProductRow[]}
		emptyMessage="No products yet."
	>
		{#snippet children()}
			<Button href="/admin/products/new" size="sm">
				<PlusIcon class="size-4" />
				Add
			</Button>
		{/snippet}
	</DataTable>
</div>

<DeleteConfirmDialog
	bind:open={showConfirm}
	title="Delete Product"
	description="Are you sure? This cannot be undone."
	formAction="?/delete"
	itemId={deleteId}
/>
