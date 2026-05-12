<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import RowActions from '$lib/admin/RowActions.svelte';
	import { formatDate } from '$lib/admin/column-helpers';
	import StarIcon from '@lucide/svelte/icons/star';

	let { data } = $props();

	let deleteId = $state('');
	let showDelete = $state(false);

	type ReviewRow = { id: string; rating: number; title: string; body: string; productName: string; userName: string; created: string };

	const ch = createColumnHelper<ReviewRow>();
	const columns = [
		ch.accessor('productName', {
			header: 'Product',
			cell: (ctx) => `<span class="text-foreground font-medium">${ctx.getValue()}</span>`,
		}),
		ch.accessor('userName', {
			header: 'User',
			cell: (ctx) => `<span class="text-muted-foreground">${ctx.getValue()}</span>`,
		}),
		ch.accessor('rating', {
			header: 'Rating',
			cell: (ctx) => {
				const rating = ctx.getValue();
				const stars = Array(rating).fill(null).map(() => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="size-3 text-amber-400 inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('');
				return `<span class="flex items-center gap-0.5">${stars}<span class="text-xs text-muted-foreground ml-1">${rating}/5</span></span>`;
			},
		}),
		ch.accessor('title', {
			header: 'Title',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<span class="text-foreground text-sm">${v || 'No title'}</span>`;
			},
		}),
		ch.accessor('body', {
			header: 'Body',
			cell: (ctx) => `<span class="text-muted-foreground text-sm line-clamp-1">${ctx.getValue()}</span>`,
		}),
		ch.accessor('created', {
			header: 'Date',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: RowActions,
				props: {
					itemId: ctx.row.original.id,
					ondelete: (id: string) => { deleteId = id; showDelete = true; },
				},
			}),
		}),
	];
</script>

<div>
	<h1 class="text-2xl font-semibold text-foreground mb-6">Reviews</h1>

	<DataTable
		columns={columns}
		data={data.reviews as ReviewRow[]}
		emptyMessage="No reviews yet."
	/>
</div>

<DeleteConfirmDialog
	bind:open={showDelete}
	title="Remove Review"
	description="This review will be permanently deleted."
	formAction="?/delete"
	itemId={deleteId}
/>
