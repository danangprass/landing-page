<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import DataTable from '$lib/admin/DataTable.svelte';
	import { formatCurrency, formatDate, truncateId, statusBadgeClass } from '$lib/admin/column-helpers';

	let { data } = $props();

	const kpis = [
		{ label: 'Total Revenue', value: formatCurrency(data.kpis.totalRevenue), color: 'text-green-700' },
		{ label: 'Monthly Revenue', value: formatCurrency(data.kpis.monthlyRevenue), color: 'text-green-700' },
		{ label: 'Total Orders', value: data.kpis.totalOrders.toLocaleString(), color: 'text-blue-700' },
		{ label: 'Pending Orders', value: data.kpis.pendingOrders.toLocaleString(), color: data.kpis.pendingOrders > 0 ? 'text-amber-700' : 'text-muted-foreground' },
		{ label: 'Total Products', value: data.kpis.totalProducts.toLocaleString(), color: 'text-foreground' },
		{ label: 'Total Users', value: data.kpis.totalUsers.toLocaleString(), color: 'text-foreground' },
		{ label: 'Low Stock', value: data.kpis.lowStock.toLocaleString(), color: data.kpis.lowStock > 0 ? 'text-red-700' : 'text-muted-foreground' },
	];

	type OrderRow = { id: string; userName: string; total: number; status: string; created: string };

	const ch = createColumnHelper<OrderRow>();
	const orderColumns = [
		ch.accessor('id', {
			header: 'Order',
			cell: (ctx) => {
				const id = ctx.getValue();
				return `<a href="/admin/orders/${id}" class="text-primary hover:underline font-mono text-xs">${truncateId(id)}</a>`;
			},
		}),
		ch.accessor('userName', { header: 'Customer' }),
		ch.accessor('total', {
			header: 'Total',
			cell: (ctx) => formatCurrency(ctx.getValue()),
		}),
		ch.accessor('status', {
			header: 'Status',
			cell: (ctx) => {
				const s = ctx.getValue();
				return { component: Badge, props: { variant: 'outline' as const, class: statusBadgeClass(s), children: s } };
			},
		}),
		ch.accessor('created', {
			header: 'Date',
			cell: (ctx) => formatDate(ctx.getValue()),
		}),
	];
</script>

<div>
	<h1 class="text-2xl font-semibold text-foreground mb-6">Dashboard</h1>

	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
		{#each kpis as kpi}
			<Card class="border-border">
				<CardHeader>
					<CardTitle class="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-xl font-semibold {kpi.color}">{kpi.value}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<div class="bg-card border border-border rounded-xl p-5">
		<h2 class="text-sm font-semibold text-foreground mb-4">Recent Orders</h2>
		<DataTable
			columns={orderColumns}
			data={data.recentOrders as OrderRow[]}
			emptyMessage="No orders yet."
		/>
	</div>
</div>
