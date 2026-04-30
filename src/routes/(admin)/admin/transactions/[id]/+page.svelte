<script lang="ts">
	let { data } = $props();

	const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

	function statusClass(s: string) {
		const map: Record<string, string> = {
			pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
			settlement: 'bg-green-500/15 text-green-400 border-green-500/30',
			shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
			cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
			expire: 'bg-red-500/15 text-red-400 border-red-500/30',
			deny: 'bg-red-500/15 text-red-400 border-red-500/30',
			failure: 'bg-red-500/15 text-red-400 border-red-500/30',
		};
		return map[s] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30';
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
		<a href="/admin/transactions" class="text-[#86868b] hover:text-[#f5f5f7]" aria-label="Back to transactions">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<h1 class="text-2xl font-semibold text-[#f5f5f7]">Transaction <span class="font-mono text-[#86868b] text-sm">{data.transaction.id.slice(0, 12)}...</span></h1>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Transaction Info -->
		<div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-5 space-y-4">
			<h2 class="text-sm font-semibold text-[#f5f5f7] uppercase tracking-wider">Transaction Information</h2>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-[#86868b]">Customer</span>
					<p class="text-[#f5f5f7] font-medium">{data.transaction.userName}</p>
					<p class="text-[#86868b] text-xs">{data.transaction.userEmail}</p>
				</div>
				<div>
					<span class="text-[#86868b]">Amount</span>
					<p class="text-[#f5f5f7] font-medium text-lg">${data.transaction.amount.toLocaleString()}</p>
				</div>
				<div>
					<span class="text-[#86868b]">Order ID</span>
					<p class="text-[#f5f5f7] font-mono text-xs">
						{#if typeof data.transaction.order_id === 'string' && data.transaction.order_id !== '-'}
							<a href="/admin/orders/{data.transaction.order_id}" class="text-[#2997ff] hover:underline">
								{data.transaction.order_id.slice(0, 12)}...
							</a>
						{:else}
							{data.transaction.order_id}
						{/if}
					</p>
				</div>
				<div>
					<span class="text-[#86868b]">Payment Method</span>
					<p class="text-[#f5f5f7]">{data.transaction.payment_method}</p>
				</div>
			</div>

			<div>
				<span class="text-sm text-[#86868b]">Created</span>
				<p class="text-[#f5f5f7] text-sm mt-0.5">{formatDate(data.transaction.created)}</p>
			</div>
			<div>
				<span class="text-sm text-[#86868b]">Last Updated</span>
				<p class="text-[#f5f5f7] text-sm mt-0.5">{formatDate(data.transaction.updated)}</p>
			</div>
		</div>

		<!-- Status & Payment -->
		<div class="space-y-6">
			<div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-5 space-y-4">
				<h2 class="text-sm font-semibold text-[#f5f5f7] uppercase tracking-wider">Current Status</h2>
				<div class="flex items-center gap-4">
					<div class="text-center">
						<span class="text-xs text-[#86868b] block mb-1">Payment</span>
						<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border {statusClass(data.transaction.status)}">{data.transaction.status}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Transaction Details JSON -->
	<div class="mt-6 bg-[#1d1d1f] border border-[#424245] rounded-xl p-5">
		<button
			class="w-full flex items-center justify-between text-sm font-semibold text-[#f5f5f7] uppercase tracking-wider"
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
		</button>

		{#if transactionDetailsExpanded}
			<div class="mt-4">
				{#if data.transaction.transaction_details}
					<pre class="bg-[#000] border border-[#424245]/50 rounded-lg p-4 overflow-x-auto text-xs font-mono text-[#30d158] leading-relaxed whitespace-pre-wrap break-all">{formattedJson}</pre>
				{:else}
					<p class="text-[#86868b] text-sm">No transaction details available.</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
