<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';

	let { data, form } = $props();

	let deleteId = $state('');
	let showDeleteConfirm = $state(false);

	const formatDate = (d: string) => {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-[#f5f5f7]">Pages</h1>
		<Button
			href="/admin/pages/new"
			class="inline-flex items-center gap-1.5 bg-[#2997ff] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0a84ff] transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New Page
		</Button>
	</div>

	{#if form?.error}
		<div class="px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm mb-4">{form.error}</div>
	{/if}

	{#if data.pages.length === 0}
		<div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
			<p class="text-[#86868b] text-sm">No pages yet. Create your first page to populate footer links.</p>
		</div>
	{:else}
		<div class="grid gap-3">
			{#each data.pages as page}
				<div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-4 flex items-center gap-4">
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2">
							<a href="/admin/pages/{page.id}" class="text-[#f5f5f7] font-medium text-sm hover:text-[#2997ff] transition-colors truncate">
								{page.title}
							</a>
						</div>
						<p class="text-xs text-[#86868b] mt-0.5 truncate">/{page.slug} &middot; Updated {formatDate(page.updated)}</p>
					</div>

					<div class="flex items-center gap-2 shrink-0">
						<a href="/{page.slug}" class="text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors" target="_blank" rel="noopener">View</a>
						<a href="/admin/pages/{page.id}" class="text-xs text-[#2997ff] hover:underline">Edit</a>
						<Button
							variant="link"
							class="text-xs text-[#ff453a] hover:underline"
							onclick={() => { deleteId = page.id; showDeleteConfirm = true; }}
						>
							Delete
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={() => (showDeleteConfirm = false)}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4"
			onclick={(e: MouseEvent) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete Page</h3>
			<p class="text-[#86868b] text-sm mb-6">Are you sure? This cannot be undone. The page will no longer be available to visitors.</p>
			<div class="flex justify-end gap-3">
				<Button
					variant="outline"
					class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f]"
					onclick={() => (showDeleteConfirm = false)}
				>Cancel</Button>
				<form method="post" action="?/delete">
					<input type="hidden" name="id" value={deleteId} />
					<Button type="submit" variant="destructive" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56]">
						Delete
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}
