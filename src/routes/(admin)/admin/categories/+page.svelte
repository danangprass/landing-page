<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import CategoryActions from './CategoryActions.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data } = $props();

	let deleteId = $state('');
	let showDeleteConfirm = $state(false);

	type CatRow = { id: string; name: string; slug: string; description: string; active: boolean };

	const ch = createColumnHelper<CatRow>();
	const columns = [
		ch.accessor('name', {
			header: 'Name',
			cell: (ctx) => {
				const row = ctx.row.original;
				return `<a href="/admin/categories/${row.id}" class="text-foreground font-medium hover:text-primary transition-colors">${row.name}</a>`;
			},
		}),
		ch.accessor('slug', { header: 'Slug' }),
		ch.accessor('active', {
			header: 'Status',
			cell: (ctx) => ({
				component: Badge,
				props: {
					variant: 'outline' as const,
					class: ctx.getValue() ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30',
					children: ctx.getValue() ? 'Active' : 'Inactive',
				},
			}),
		}),
		ch.accessor('description', {
			header: 'Description',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<span class="text-muted-foreground text-sm line-clamp-1">${v || '-'}</span>`;
			},
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: CategoryActions,
				props: {
					editHref: `/admin/categories/${ctx.row.original.id}`,
					itemId: ctx.row.original.id,
					ondelete: (id: string) => { deleteId = id; showDeleteConfirm = true; },
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Categories</h1>
		<Button href="/admin/categories/new">
			<PlusIcon class="size-4" />
			New Category
		</Button>
	</div>

	<DataTable
		columns={columns}
		data={data.categories as CatRow[]}
		emptyMessage="No categories yet."
	/>
</div>

<DeleteConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Category"
	description="Are you sure? This cannot be undone."
	formAction="?/delete"
	itemId={deleteId}
/>
