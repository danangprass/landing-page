<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let {
		open = $bindable(false),
		title = 'Delete Item',
		description = 'Are you sure? This cannot be undone.',
		formAction = '?/delete',
		itemId,
		extraFields = [] as { name: string; value: string }[],
	}: {
		open?: boolean;
		title?: string;
		description?: string;
		formAction?: string;
		itemId: string;
		extraFields?: { name: string; value: string }[];
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<form method="post" action={formAction}>
				<input type="hidden" name="id" value={itemId} />
				{#each extraFields as field}
					<input type="hidden" name={field.name} value={field.value} />
				{/each}
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
