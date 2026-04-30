<script lang="ts">
	let { data } = $props();

	function statusClass(status: string) {
		const map: Record<string, string> = {
			paid: 'bg-green-500/15 text-green-400 border-green-500/30',
			shipped: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
			delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
			cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
			failed: 'bg-red-500/15 text-red-400 border-red-500/30',
		};
		return map[status] ?? 'bg-amber-500/15 text-amber-400 border-amber-500/30';
	}

	function formatPrice(dollars: number): string {
		return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
	}

	function formatDate(iso: string): string {
		if (!iso) return '-';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<svelte:head>
	<title>Orders — RuFlo</title>
</svelte:head>

<div class="section-padding">
	<nav class="py-4 text-sm text-text-secondary" aria-label="Breadcrumb">
		<ol class="flex items-center gap-2">
			<li><a href="/" class="breadcrumb-link">Home</a></li>
			<li><span class="text-text-secondary/50">/</span></li>
			<li class="text-text-primary">Orders</li>
		</ol>
	</nav>

	<div class="py-8 border-b border-border">
		<h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">
			Order History
		</h1>
	</div>

	{#if data.orders.length === 0}
		<div class="flex flex-col items-center justify-center py-24 gap-4 text-center">
			<svg class="w-16 h-16 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
			</svg>
			<p class="text-xl font-medium text-text-primary">No orders yet.</p>
			<p class="text-text-secondary">Your past purchases will appear here.</p>
			<a href="/products" class="btn-primary mt-2">Browse Products</a>
		</div>
	{:else}
		<div class="py-8 space-y-4">
			{#each data.orders as order (order.id)}
				<a href="/orders/{order.id}" class="order-card block">
					<div class="order-header">
						<div>
							<span class="text-xs text-text-secondary uppercase tracking-wide">Order</span>
							<span class="order-id">#{order.id.slice(-7)}</span>
						</div>
						<span class="status-badge {statusClass(order.status)}">{order.status}</span>
					</div>

					<div class="order-body">
						<div class="order-items-preview">
							{#each order.previewItems as item}
								<div class="order-item">
									<div class="item-image-placeholder">
										{#if item.image}
											<img src={item.image} alt={item.name} class="item-image" loading="lazy" />
										{:else}
											<span class="text-lg">📦</span>
										{/if}
									</div>
									<div class="item-info">
										<span class="item-name">{item.name}</span>
										<span class="item-qty">Qty: {item.quantity}</span>
									</div>
									<span class="item-price">{formatPrice(item.price * item.quantity)}</span>
								</div>
							{/each}
							{#if order.itemCount > 3}
								<p class="text-xs text-text-secondary ml-4 mt-1">+{order.itemCount - 3} more items</p>
							{/if}
						</div>

						<div class="order-footer">
							<span class="text-sm text-text-secondary">{formatDate(String(order.created))}</span>
							<span class="text-lg font-semibold text-text-primary">{formatPrice(order.total)}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.section-padding {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem 3rem;
	}
	@media (min-width: 768px) {
		.section-padding { padding: 0 3rem 4rem; }
	}
	@media (min-width: 1024px) {
		.section-padding { padding: 0 5rem 5rem; }
	}

	.breadcrumb-link {
		color: var(--color-text-secondary);
		text-decoration: none;
	}
	.breadcrumb-link:hover { color: var(--color-text-primary); }

	.order-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: border-color 200ms;
	}
	@media (hover: hover) and (pointer: fine) {
		.order-card:hover { border-color: var(--color-accent); }
	}

	.order-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		background: color-mix(in srgb, var(--color-surface) 60%, var(--color-bg));
		border-bottom: 1px solid var(--color-border);
	}

	.order-id {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-left: 0.5rem;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		border: 1px solid transparent;
		text-transform: capitalize;
	}

	.order-body { padding: 1rem 1.25rem; }

	.order-items-preview {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.order-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.item-image-placeholder {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface) 50%, var(--color-bg));
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.item-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-info { flex: 1; min-width: 0; }

	.item-name {
		font-size: 0.875rem;
		color: var(--color-text-primary);
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-qty {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.item-price {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		flex-shrink: 0;
	}

	.order-footer {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
