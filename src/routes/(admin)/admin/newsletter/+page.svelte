<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import { formatDate } from '$lib/admin/column-helpers';
	import NewsletterActions from './NewsletterActions.svelte';

	let { data } = $props();

	let deleteId = $state('');
	let showDelete = $state(false);

	type SubRow = { id: string; email: string; active: boolean; created: string };

	const ch = createColumnHelper<SubRow>();
	const columns = [
		ch.accessor('email', {
			header: 'Email',
			cell: (ctx) => `<span class="font-mono text-xs">${ctx.getValue()}</span>`,
		}),
		ch.accessor('active', {
			header: 'Status',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: ctx.getValue() ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200', children: ctx.getValue() ? 'Active' : 'Inactive' },
			}),
		}),
		ch.accessor('created', {
			header: 'Subscribed',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: NewsletterActions,
				props: {
					itemId: ctx.row.original.id,
					active: ctx.row.original.active,
					ondelete: (id: string) => { deleteId = id; showDelete = true; },
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Newsletter Subscribers</h1>
		<span class="text-sm text-muted-foreground">{data.subscribers.length} total</span>
	</div>

	<DataTable
		columns={columns}
		data={data.subscribers as SubRow[]}
		emptyMessage="No subscribers yet."
	/>
</div>

<DeleteConfirmDialog
	bind:open={showDelete}
	title="Delete Subscriber"
	description="Permanently remove this subscriber?"
	formAction="?/delete"
	itemId={deleteId}
/>
