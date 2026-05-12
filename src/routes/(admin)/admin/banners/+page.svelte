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
	import BannerActions from './BannerActions.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data } = $props();

	let showForm = $state(false);
	let editId = $state('');
	let editTitle = $state('');
	let editSubtitle = $state('');
	let editLinkUrl = $state('');
	let editSortOrder = $state('0');
	let editActive = $state(false);
	let isEdit = $state(false);

	let deleteId = $state('');
	let showDelete = $state(false);

	function openCreate() {
		isEdit = false;
		editId = '';
		editTitle = '';
		editSubtitle = '';
		editLinkUrl = '';
		editSortOrder = '0';
		editActive = true;
		showForm = true;
	}

	function openEdit(b: { id: string; title: string; subtitle: string; link_url: string; active: boolean; sort_order: number }) {
		isEdit = true;
		editId = b.id;
		editTitle = b.title;
		editSubtitle = b.subtitle;
		editLinkUrl = b.link_url;
		editSortOrder = String(b.sort_order);
		editActive = b.active;
		showForm = true;
	}

	type BannerRow = { id: string; title: string; subtitle: string; link_url: string; active: boolean; sort_order: number };

	const ch = createColumnHelper<BannerRow>();
	const columns = [
		ch.accessor('title', {
			header: 'Title',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<span class="text-foreground font-medium">${v || 'Untitled'}</span>`;
			},
		}),
		ch.accessor('subtitle', {
			header: 'Subtitle',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<span class="text-muted-foreground text-sm">${v || '-'}</span>`;
			},
		}),
		ch.accessor('link_url', {
			header: 'Link URL',
			cell: (ctx) => {
				const v = ctx.getValue();
				return `<code class="text-xs text-muted-foreground">${v || '-'}</code>`;
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
		ch.accessor('sort_order', { header: 'Order' }),
		ch.display({
			id: 'actions',
			header: 'Actions',
			cell: (ctx) => ({
				component: BannerActions,
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
		<h1 class="text-2xl font-semibold text-foreground">Banners</h1>
		<Button onclick={openCreate}>
			<PlusIcon class="size-4" />
			New Banner
		</Button>
	</div>

	<DataTable
		columns={columns}
		data={data.banners as BannerRow[]}
		emptyMessage="No banners yet."
	/>
</div>

<Dialog.Root bind:open={showForm}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? 'Edit Banner' : 'New Banner'}</Dialog.Title>
		</Dialog.Header>

		<form method="post" action="?/{isEdit ? 'update' : 'create'}" enctype="multipart/form-data" class="space-y-4 mt-4">
			{#if isEdit}
				<input type="hidden" name="id" value={editId} />
			{/if}

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">Title</Label>
				<Input type="text" name="title" value={editTitle} oninput={(e) => (editTitle = (e.target as HTMLInputElement).value)} />
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">Subtitle</Label>
				<Input type="text" name="subtitle" value={editSubtitle} oninput={(e) => (editSubtitle = (e.target as HTMLInputElement).value)} />
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">Link URL</Label>
				<Input type="text" name="link_url" value={editLinkUrl} oninput={(e) => (editLinkUrl = (e.target as HTMLInputElement).value)} class="font-mono" placeholder="/products" />
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">Sort Order</Label>
				<Input type="number" name="sort_order" min="0" value={editSortOrder} oninput={(e) => (editSortOrder = (e.target as HTMLInputElement).value)} class="w-24" />
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-sm text-muted-foreground">{isEdit ? 'Replace Image' : 'Image'}</Label>
				<Input type="file" name="image" accept="image/*" class="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-primary/15 file:text-primary file:border-0 hover:file:bg-primary/25 file:transition-colors" />
			</div>

			<input type="hidden" name="active" value={String(editActive)} />
			<label class="flex items-center gap-2.5 cursor-pointer">
				<Checkbox bind:checked={editActive} />
				<span class="text-sm text-foreground">Active</span>
			</label>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (showForm = false)}>Cancel</Button>
				<Button type="submit">
					{isEdit ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<DeleteConfirmDialog
	bind:open={showDelete}
	title="Delete Banner"
	description="Are you sure?"
	formAction="?/delete"
	itemId={deleteId}
/>
