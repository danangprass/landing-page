<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();

	const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

	function statusClass(s: string) {
		const map: Record<string, string> = {
			pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
			settlement: 'bg-green-50 text-green-700 border-green-200',
			shipped: 'bg-purple-50 text-purple-700 border-purple-200',
			cancelled: 'bg-red-50 text-red-700 border-red-200',
			expire: 'bg-red-50 text-red-700 border-red-200',
			deny: 'bg-red-50 text-red-700 border-red-200',
			failure: 'bg-red-50 text-red-700 border-red-200',
		};
		return map[s] ?? 'bg-gray-100 text-gray-500 border-gray-200';
	}

	let transactionDetailsExpanded = $state(false);
	let formattedJson = $derived(
		data.transaction.transaction_details
			? JSON.stringify(data.transaction.transaction_details, null, 2)
			: ''
	);
</script>

<div>
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/transactions" class="text-muted-foreground hover:text-foreground" aria-label="Back to transactions">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<h1 class="text-2xl font-semibold text-foreground">Transaction <span class="font-mono text-muted-foreground text-sm">{data.transaction.id.slice(0, 12)}...</span></h1>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Transaction Info -->
		<div class="bg-background border border-border rounded-xl p-5 space-y-4">
			<h2 class="text-sm font-semibold text-foreground uppercase tracking-wider">Transaction Information</h2>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-muted-foreground">Customer</span>
					<p class="text-foreground font-medium">{data.transaction.userName}</p>
					<p class="text-muted-foreground text-xs">{data.transaction.userEmail}</p>
				</div>
				<div>
					<span class="text-muted-foreground">Amount</span>
					<p class="text-foreground font-medium text-lg">${data.transaction.amount.toLocaleString()}</p>
				</div>
				<div>
					<span class="text-muted-foreground">Order ID</span>
					<p class="text-foreground font-mono text-xs">
						{#if typeof data.transaction.order_id === 'string' && data.transaction.order_id !== '-'}
							<a href="/admin/orders/{data.transaction.order_id}" class="text-primary hover:underline">
								{data.transaction.order_id.slice(0, 12)}...
							</a>
						{:else}
							{data.transaction.order_id}
						{/if}
					</p>
				</div>
				<div>
					<span class="text-muted-foreground">Payment Method</span>
					<p class="text-foreground">{data.transaction.payment_method}</p>
				</div>
			</div>

			<div>
				<span class="text-sm text-muted-foreground">Created</span>
				<p class="text-foreground text-sm mt-0.5">{formatDate(data.transaction.created)}</p>
			</div>
			<div>
				<span class="text-sm text-muted-foreground">Last Updated</span>
				<p class="text-foreground text-sm mt-0.5">{formatDate(data.transaction.updated)}</p>
			</div>
		</div>

		<!-- Status & Payment -->
		<div class="space-y-6">
			<div class="bg-background border border-border rounded-xl p-5 space-y-4">
				<h2 class="text-sm font-semibold text-foreground uppercase tracking-wider">Current Status</h2>
				<div class="flex items-center gap-4">
					<div class="text-center">
						<span class="text-xs text-muted-foreground block mb-1">Payment</span>
						<Badge variant="outline" class={statusClass(data.transaction.status)}>{data.transaction.status}</Badge>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Transaction Details JSON -->
	<div class="mt-6 bg-background border border-border rounded-xl p-5">
		<Button
			variant="ghost"
			class="w-full flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wider"
			onclick={() => (transactionDetailsExpanded = !transactionDetailsExpanded)}
			aria-expanded={transactionDetailsExpanded}
		>
			Transaction Details (JSON)
			<svg
				class="w-5 h-5 transition-transform {transactionDetailsExpanded ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</Button>

		{#if transactionDetailsExpanded}
			<div class="mt-4">
				{#if data.transaction.transaction_details}
					<pre class="bg-background border border-border/50 rounded-lg p-4 overflow-x-auto text-xs font-mono text-green-700 leading-relaxed whitespace-pre-wrap break-all">{formattedJson}</pre>
				{:else}
					<p class="text-muted-foreground text-sm">No transaction details available.</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
