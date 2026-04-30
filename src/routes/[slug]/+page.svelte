<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.page.title} &mdash; ElectraStore</title>
	<meta name="description" content={data.page.title + " — ElectraStore"} />
</svelte:head>

<div class="info-page">
	<div class="info-container">
		<a href="/" class="back-link">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
			Back to Store
		</a>
		<h1 class="info-title">{data.page.title}</h1>

		{#if data.page.content}
			<div class="info-content">
				{@html data.page.content}
			</div>
		{:else}
			<div class="info-empty">
				<p class="info-empty-text">No content has been added to this page yet.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.info-page {
		min-height: 100vh;
		padding: 6rem 1rem 4rem;
	}

	.info-container {
		max-width: 720px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: var(--color-accent);
		text-decoration: none;
		margin-bottom: 2rem;
		transition: opacity 160ms var(--ease-out);
	}
	.back-link:active {
		opacity: 0.7;
	}

	.info-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		letter-spacing: -0.025em;
		margin-bottom: 2.5rem;
	}

	.info-content {
		font-size: 1rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}

	.info-content :global(h2) {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 2.5rem 0 0.75rem;
	}

	.info-content :global(h3) {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 2rem 0 0.5rem;
	}

	.info-content :global(p) {
		margin-bottom: 1rem;
	}

	.info-content :global(ul), .info-content :global(ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	.info-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.info-content :global(a) {
		color: var(--color-accent);
		text-decoration: none;
	}
	.info-content :global(a:hover) {
		text-decoration: underline;
	}

	.info-content :global(strong) {
		color: var(--color-text-primary);
	}

	.info-empty {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
	}

	.info-empty-text {
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		margin: 0;
	}

	@media (max-width: 767px) {
		.info-title {
			font-size: 1.75rem;
		}
		.info-page {
			padding-top: 4rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-link {
			transition: none;
		}
	}
</style>
