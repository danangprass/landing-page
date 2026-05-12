<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';

	let {
		itemId,
		active,
		ondelete,
	}: {
		itemId: string;
		active: boolean;
		ondelete: (id: string) => void;
	} = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<form method="post" action="?/toggleActive" class="inline">
		<input type="hidden" name="id" value={itemId} />
		<input type="hidden" name="active" value={String(active)} />
		<Button type="submit" variant="link" class="text-primary text-xs hover:underline p-0 h-auto">
			{active ? 'Deactivate' : 'Activate'}
		</Button>
	</form>
	<Button variant="link" class="text-destructive text-xs hover:underline p-0 h-auto" onclick={() => ondelete(itemId)}>
		Delete
	</Button>
</div>
