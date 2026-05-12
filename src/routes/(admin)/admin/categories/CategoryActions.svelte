<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';

	let {
		editHref,
		itemId,
		ondelete,
	}: {
		editHref: string;
		itemId: string;
		ondelete: (id: string) => void;
	} = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<Button variant="link" class="text-primary text-xs hover:underline p-0 h-auto" href={editHref}>
		<PencilIcon class="size-3" /> Edit
	</Button>
	<Button variant="link" class="text-destructive text-xs hover:underline p-0 h-auto" onclick={() => ondelete(itemId)}>
		<TrashIcon class="size-3" /> Delete
	</Button>
</div>
