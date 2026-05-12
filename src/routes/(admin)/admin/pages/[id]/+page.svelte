<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	let { data, form } = $props();

	const isNew = data.page === null;

	let titleValue = $state(data.page?.title ?? '');
	let slug = $state(data.page?.slug ?? '');
	let contentValue = $state(data.page?.content ?? '');

	function generateSlug(v: string) {
		titleValue = v;
		if (isNew) {
			slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		}
	}
</script>

<div>
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/pages" class="text-muted-foreground hover:text-foreground transition-colors">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<h1 class="text-2xl font-semibold text-foreground">{isNew ? 'New Page' : 'Edit Page'}</h1>
	</div>

	<form method="post" action="?/save" class="max-w-2xl space-y-5">
		{#if form?.error}
			<div class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{form.error}</div>
		{/if}

		<div class="flex flex-col gap-1.5">
			<Label class="text-sm font-medium text-foreground" for="title">Title <span class="text-destructive">*</span></Label>
			<Input
				id="title"
				type="text" name="title" required
				value={titleValue}
				oninput={(e) => generateSlug((e.target as HTMLInputElement).value)}
				class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<Label class="text-sm font-medium text-foreground" for="slug">Slug <span class="text-destructive">*</span></Label>
			<Input
				id="slug"
				type="text" name="slug" required
				value={slug}
				oninput={(e) => (slug = (e.target as HTMLInputElement).value)}
				class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary font-mono"
			/>
			<p class="text-xs text-muted-foreground">The URL path for this page. Use lowercase letters, numbers, and hyphens.</p>
		</div>

		<div class="flex flex-col gap-1.5">
			<Label class="text-sm font-medium text-foreground" for="content">Content</Label>
			<textarea
				id="content"
				name="content" rows="16"
				class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:border-primary resize-y"
			>{contentValue}</textarea>
			<p class="text-xs text-muted-foreground">Rich text content for this page. HTML tags are supported for formatting.</p>
		</div>

		<div class="flex items-center gap-3 pt-2">
			<Button type="submit" class="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
				{isNew ? 'Create Page' : 'Save Changes'}
			</Button>
			<Button variant="outline" href="/admin/pages" class="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
				Cancel
			</Button>
		</div>
	</form>
</div>
