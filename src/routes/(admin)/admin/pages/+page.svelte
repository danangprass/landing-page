<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import RowActions from '$lib/admin/RowActions.svelte';
	import { formatDate } from '$lib/admin/column-helpers';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data, form } = $props();

	let deleteId = $state('');
	let showDeleteConfirm = $state(false);

	type PageRow = { id: string; title: string; slug: string; updated: string };

	const ch = createColumnHelper<PageRow>();
	const columns = [
		ch.accessor('title', {
			header: 'Title',
			cell: (ctx) => {
				const row = ctx.row.original;
				return `<a href="/admin/pages/${row.id}" class="text-foreground font-medium hover:text-primary transition-colors">${row.title}</a>`;
			},
		}),
		ch.accessor('slug', {
			header: 'Slug',
			cell: (ctx) => {
				const slug = ctx.getValue();
				return `<a href="/${slug}" target="_blank" rel="noopener" class="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">/${slug}</a>`;
			},
		}),
		ch.accessor('updated', {
			header: 'Updated',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: RowActions,
				props: {
					editHref: `/admin/pages/${ctx.row.original.id}`,
					itemId: ctx.row.original.id,
					ondelete: (id: string) => { deleteId = id; showDeleteConfirm = true; },
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Pages</h1>
		<Button href="/admin/pages/new">
			<PlusIcon class="size-4" />
			New Page
		</Button>
	</div>

	{#if form?.error}
		<div class="px-4 py-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm mb-4">{form.error}</div>
	{/if}

	<DataTable
		columns={columns}
		data={data.pages as PageRow[]}
		emptyMessage="No pages yet. Create your first page to populate footer links."
	/>
</div>

<DeleteConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Page"
	description="Are you sure? This cannot be undone. The page will no longer be available to visitors."
	formAction="?/delete"
	itemId={deleteId}
/>
