<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import RowActions from '$lib/admin/RowActions.svelte';
	import { formatDate } from '$lib/admin/column-helpers';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form } = $props();

	let deleteId = $state('');
	let deleteName = $state('');
	let showConfirm = $state(false);

	type UserRow = { id: string; name: string; email: string; role: string; verified: boolean; created: string };

	const ch = createColumnHelper<UserRow>();
	const columns = [
		ch.accessor('name', {
			header: 'Name',
			cell: (ctx) => {
				const row = ctx.row.original;
				return `<a href="/admin/users/${row.id}" class="text-foreground font-medium hover:text-primary transition-colors">${row.name}</a>`;
			},
		}),
		ch.accessor('email', {
			header: 'Email',
			cell: (ctx) => `<span class="font-mono text-xs">${ctx.getValue()}</span>`,
		}),
		ch.accessor('role', {
			header: 'Role',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: ctx.getValue() === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200', children: ctx.getValue() },
			}),
		}),
		ch.accessor('verified', {
			header: 'Verified',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: ctx.getValue() ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200', children: ctx.getValue() ? 'Yes' : 'No' },
			}),
		}),
		ch.accessor('created', {
			header: 'Joined',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: RowActions,
				props: {
					editHref: `/admin/users/${ctx.row.original.id}`,
					itemId: ctx.row.original.id,
					ondelete: (id: string) => {
						const users = data.users as UserRow[];
							const user = users.find((u) => u.id === id);
						deleteId = id;
						deleteName = user?.name ?? '';
						showConfirm = true;
					},
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Users</h1>
		<form class="flex items-center gap-2" method="get">
			<Input
				type="text"
				name="search"
				value={data.search}
				placeholder="Search users..."
			/>
			<Button type="submit" variant="secondary" size="sm">
				<SearchIcon class="size-4" />
				Search
			</Button>
			{#if data.search}
				<Button variant="outline" size="sm" href="/admin/users">
					<XIcon class="size-4" />
					Clear
				</Button>
			{/if}
		</form>
	</div>

	{#if form?.error}
		<div class="mb-6 px-4 py-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm">
			{form.error}
		</div>
	{/if}

	<DataTable
		columns={columns}
		data={data.users as UserRow[]}
		emptyMessage={data.search ? `No users matching "${data.search}"` : 'No users found.'}
	/>
</div>

<DeleteConfirmDialog
	bind:open={showConfirm}
	title="Delete User"
	description="Are you sure you want to delete {deleteName}? This cannot be undone."
	formAction="?/delete"
	itemId={deleteId}
/>
