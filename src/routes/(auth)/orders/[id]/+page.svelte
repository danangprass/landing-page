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
			month: 'long',
			day: 'numeric',
		});
	}
</script>

<svelte:head>
	<title>Order #{data.order.id.slice(-7)} — RuFlo</title>
</svelte:head>

<div class="section-padding">
	<nav class="py-4 text-sm text-text-secondary" aria-label="Breadcrumb">
		<ol class="flex items-center gap-2">
			<li><a href="/" class="breadcrumb-link">Home</a></li>
			<li><span class="text-text-secondary/50">/</span></li>
			<li><a href="/orders" class="breadcrumb-link">Orders</a></li>
			<li><span class="text-text-secondary/50">/</span></li>
			<li class="text-text-primary">#{data.order.id.slice(-7)}</li>
		</ol>
	</nav>

	<div class="py-8 border-b border-border">
		<div class="flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
					Order #{data.order.id.slice(-7)}
				</h1>
				<p class="mt-1 text-text-secondary">{formatDate(String(data.order.created))}</p>
			</div>
			<span class="status-badge {statusClass(data.order.status)}">{data.order.status}</span>
		</div>
	</div>

	<div class="py-8">
		<h2 class="text-xl font-semibold text-text-primary mb-4">Items</h2>

		<div class="space-y-3">
			{#each data.lineItems as item (item.id)}
				<div class="item-row">
					<div class="item-img-wrap">
						{#if item.image}
							<img src={item.image} alt={item.name} class="item-img" loading="lazy" />
						{:else}
							<span class="text-2xl">📦</span>
						{/if}
					</div>
					<div class="item-details">
						{#if item.slug}
							<a href="/products/{item.slug}" class="item-link">{item.name}</a>
						{:else}
							<span class="item-name">{item.name}</span>
						{/if}
						<span class="text-sm text-text-secondary">Qty: {item.quantity}</span>
					</div>
					<span class="item-line-total">{formatPrice(item.price * item.quantity)}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="summary-box">
		<div class="summary-row">
			<span class="text-text-secondary">Subtotal</span>
			<span class="text-text-primary font-medium">
				{formatPrice(data.lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0))}
			</span>
		</div>
		<div class="summary-row">
			<span class="text-text-secondary">Tax</span>
			<span class="text-text-primary font-medium">
				{formatPrice(data.lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 0.1)}
			</span>
		</div>
		<div class="summary-row total-row">
			<span class="text-text-primary font-semibold">Total</span>
			<span class="text-xl font-bold text-text-primary">{formatPrice(Number(data.order.total))}</span>
		</div>
	</div>

	<div class="mt-8">
		<a href="/orders" class="text-sm text-[var(--color-accent)] no-underline hover:underline">← Back to Orders</a>
	</div>
</div>

<style>
	.section-padding {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 1.5rem 3rem;
	}
	@media (min-width: 768px) {
		.section-padding { padding: 0 3rem 4rem; }
	}

	.breadcrumb-link {
		color: var(--color-text-secondary);
		text-decoration: none;
	}
	.breadcrumb-link:hover { color: var(--color-text-primary); }

	.status-badge {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid transparent;
		text-transform: capitalize;
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.item-img-wrap {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface) 50%, var(--color-bg));
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.item-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-details { flex: 1; display: flex; flex-direction: column; }

	.item-link {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
		text-decoration: none;
	}
	.item-link:hover { color: var(--color-accent); }

	.item-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.item-line-total {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
		flex-shrink: 0;
	}

	.summary-box {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		padding: 0.375rem 0;
	}

	.total-row {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border);
	}
</style>
