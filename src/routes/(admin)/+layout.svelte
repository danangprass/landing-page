<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/admin/AppSidebar.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import SidebarTriggerIcon from '@lucide/svelte/icons/panel-left';

	let { children } = $props();
</script>

<Sidebar.SidebarProvider>
	<AppSidebar />

	<Sidebar.SidebarInset>
		<header class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-xl">
			<div class="flex items-center gap-2 px-4 flex-1">
				<Sidebar.SidebarTrigger class="-ml-1 text-muted-foreground hover:text-foreground">
					<SidebarTriggerIcon class="size-5" />
				</Sidebar.SidebarTrigger>
				<Separator orientation="vertical" class="mr-2 h-4" />
				<div class="flex items-center gap-2 ml-auto">
					{#if page.data?.user}
						<span class="text-sm text-muted-foreground">{page.data.user.name}</span>
						<Badge variant="outline" class={page.data.user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
							{page.data.user.role}
						</Badge>
					{/if}
				</div>
			</div>
		</header>

		<main class="p-4 lg:p-8">
			{@render children()}
		</main>
	</Sidebar.SidebarInset>
</Sidebar.SidebarProvider>
