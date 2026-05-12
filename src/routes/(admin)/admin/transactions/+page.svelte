<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import { formatCurrency, formatDate, truncateId, statusBadgeClass } from '$lib/admin/column-helpers';

	let { data } = $props();

	const statuses = ['', 'pending', 'settlement', 'shipped', 'cancelled'];

	type TxRow = { id: string; order_id: string; userName: string; amount: number; status: string; payment_method: string; created: string };

	const ch = createColumnHelper<TxRow>();
	const columns = [
		ch.accessor('id', {
			header: 'ID',
			cell: (ctx) => {
				const id = ctx.getValue();
				return `<a href="/admin/transactions/${id}" class="text-primary hover:underline font-mono text-xs">${truncateId(id)}</a>`;
			},
		}),
		ch.accessor('order_id', {
			header: 'Order ID',
			cell: (ctx) => {
				const oid = ctx.getValue();
				return `<span class="font-mono text-xs">${typeof oid === 'string' ? truncateId(oid) : oid}</span>`;
			},
		}),
		ch.accessor('userName', { header: 'Customer' }),
		ch.accessor('amount', {
			header: 'Amount',
			cell: (ctx) => formatCurrency(ctx.getValue()),
		}),
		ch.accessor('status', {
			header: 'Status',
			cell: (ctx) => ({
				component: Badge,
				props: { variant: 'outline' as const, class: statusBadgeClass(ctx.getValue()), children: ctx.getValue() },
			}),
		}),
		ch.accessor('payment_method', { header: 'Payment Method' }),
		ch.accessor('created', {
			header: 'Date',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
	];
</script>

<div>
	<h1 class="text-2xl font-semibold text-foreground mb-6">Transactions</h1>

	<div class="flex flex-wrap gap-2 mb-6">
		{#each statuses as s}
			<a
				href="/admin/transactions{s ? '?status=' + s : ''}"
				class="px-4 py-2 rounded-xl text-sm font-medium border transition-colors {data.currentStatus === s ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'}"
			>
				{s || 'All'}
			</a>
		{/each}
	</div>

	<DataTable
		columns={columns}
		data={data.transactions as TxRow[]}
		emptyMessage="No transactions found."
	/>
</div>
