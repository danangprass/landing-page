<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import DataTable from '$lib/admin/DataTable.svelte';
	import DeleteConfirmDialog from '$lib/admin/DeleteConfirmDialog.svelte';
	import TestimonialActions from './TestimonialActions.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data } = $props();

	let showForm = $state(false);
	let deleteId = $state('');
	let showDelete = $state(false);

	let isEdit = $state(false);
	let editId = $state('');
	let eName = $state(''); let eRole = $state(''); let eBody = $state(''); let eRating = $state('5'); let eSortOrder = $state('0'); let eActive = $state(true);

	function openCreate() {
		isEdit = false; editId = ''; eName = ''; eRole = ''; eBody = ''; eRating = '5'; eSortOrder = '0'; eActive = true;
		showForm = true;
	}

	function openEdit(t: { id: string; name: string; role: string; body: string; rating: number; active: boolean; sort_order: number }) {
		isEdit = true; editId = t.id; eName = t.name; eRole = t.role; eBody = t.body; eRating = String(t.rating); eSortOrder = String(t.sort_order); eActive = t.active;
		showForm = true;
	}

	type TestimonialRow = { id: string; name: string; role: string; body: string; rating: number; active: boolean; sort_order: number };

	const ch = createColumnHelper<TestimonialRow>();
	const columns = [
		ch.accessor('name', {
			header: 'Name',
			cell: (ctx) => `<span class="text-foreground font-medium">${ctx.getValue()}</span>`,
		}),
		ch.accessor('role', {
			header: 'Role',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<span class="text-muted-foreground text-sm">${v || '-'}</span>`;
			},
		}),
		ch.accessor('body', {
			header: 'Body',
			cell: (ctx) => {
				const body = ctx.getValue();
				return `<span class="text-muted-foreground text-sm line-clamp-1">${body}</span>`;
			},
		}),
		ch.accessor('rating', {
			header: 'Rating',
			cell: (ctx) => {
				const v = ctx.getValue();
				return v > 0 ? `<span class="text-amber-400 font-medium">${v}/5</span>` : '<span class="text-muted-foreground">-</span>';
			},
		}),
		ch.accessor('active', {
			header: 'Status',
			cell: (ctx) => ({
				component: Badge,
				props: {
					variant: 'outline' as const,
					class: ctx.getValue() ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30',
					children: ctx.getValue() ? 'Active' : 'Inactive',
				},
			}),
		}),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: TestimonialActions,
				props: {
					onedit: () => openEdit(ctx.row.original),
					ondelete: () => { deleteId = ctx.row.original.id; showDelete = true; },
				},
			}),
		}),
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-foreground">Testimonials</h1>
		<Button onclick={openCreate}>
			<PlusIcon class="size-4" />
			New Testimonial
		</Button>
	</div>

	<DataTable
		columns={columns}
		data={data.testimonials as TestimonialRow[]}
		emptyMessage="No testimonials yet."
	/>
</div>

<Dialog.Root bind:open={showForm}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? 'Edit Testimonial' : 'New Testimonial'}</Dialog.Title>
		</Dialog.Header>

		<form method="post" action="?/{isEdit ? 'update' : 'create'}" enctype="multipart/form-data" class="space-y-4 mt-4">
			{#if isEdit}<input type="hidden" name="id" value={editId} />{/if}

			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<Label class="text-sm text-muted-foreground">Name <span class="text-destructive">*</span></Label>
					<Input type="text" name="name" value={eName} oninput={(e) => (eName = (e.target as HTMLInputElement).value)} required />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label class="text-sm text-muted-foreground">Role</Label>
					<Input type="text" name="role" value={eRole} oninput={(e) => (eRole = (e.target as HTMLInputElement).value)} placeholder="CEO" />
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">Body <span class="text-destructive">*</span></Label>
				<textarea name="body" rows="3" class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary resize-y" required>{eBody}</textarea>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<Label class="text-sm text-muted-foreground">Rating</Label>
					<Input type="number" name="rating" min="1" max="5" step="1" value={eRating} oninput={(e) => (eRating = (e.target as HTMLInputElement).value)} class="w-24" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label class="text-sm text-muted-foreground">Sort Order</Label>
					<Input type="number" name="sort_order" min="0" value={eSortOrder} oninput={(e) => (eSortOrder = (e.target as HTMLInputElement).value)} class="w-24" />
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">{isEdit ? 'Replace Avatar' : 'Avatar'}</Label>
				<Input type="file" name="avatar" accept="image/*" class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-primary/15 file:text-primary file:border-0 hover:file:bg-primary/25 file:transition-colors" />
			</div>

			<input type="hidden" name="active" value={String(eActive)} />
			<label class="flex items-center gap-2.5 cursor-pointer">
				<Checkbox bind:checked={eActive} />
				<span class="text-sm text-foreground">Active</span>
			</label>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (showForm = false)}>Cancel</Button>
				<Button type="submit">{isEdit ? 'Save' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<DeleteConfirmDialog
	bind:open={showDelete}
	title="Delete Testimonial"
	description="Are you sure?"
	formAction="?/delete"
	itemId={deleteId}
/>
