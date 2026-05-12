<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import PackageIcon from '@lucide/svelte/icons/package';
	import Grid3x3Icon from '@lucide/svelte/icons/grid-3x3';
	import ClipboardCheckIcon from '@lucide/svelte/icons/clipboard-check';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import UsersIcon from '@lucide/svelte/icons/users';
	import StarIcon from '@lucide/svelte/icons/star';
	import ImageIcon from '@lucide/svelte/icons/image';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import MailIcon from '@lucide/svelte/icons/mail';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon },
		{ href: '/admin/products', label: 'Products', icon: PackageIcon },
		{ href: '/admin/categories', label: 'Categories', icon: Grid3x3Icon },
		{ href: '/admin/orders', label: 'Orders', icon: ClipboardCheckIcon },
		{ href: '/admin/transactions', label: 'Transactions', icon: CreditCardIcon },
		{ href: '/admin/users', label: 'Users', icon: UsersIcon },
		{ href: '/admin/reviews', label: 'Reviews', icon: StarIcon },
		{ href: '/admin/banners', label: 'Banners', icon: ImageIcon },
		{ href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareIcon },
		{ href: '/admin/newsletter', label: 'Newsletter', icon: MailIcon },
		{ href: '/admin/pages', label: 'Pages', icon: FileTextIcon },
	];

	let pathname = $derived(page.url.pathname);

	function isActive(href: string) {
		if (href === '/admin') return pathname === '/admin';
		return pathname.startsWith(href);
	}
</script>

<Sidebar.Sidebar collapsible="icon" class="border-border">
	<Sidebar.SidebarHeader class="border-b border-border px-5 py-5">
		<a href="/" class="text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
			ElectraStore
		</a>
		<p class="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
	</Sidebar.SidebarHeader>

	<Sidebar.SidebarContent>
		<Sidebar.SidebarGroup>
			<Sidebar.SidebarGroupLabel>Menu</Sidebar.SidebarGroupLabel>
			<Sidebar.SidebarGroupContent>
				<Sidebar.SidebarMenu>
					{#each navItems as item}
						{@const active = isActive(item.href)}
						<Sidebar.SidebarMenuItem>
							<Sidebar.SidebarMenuButton
								isActive={active}
								tooltipContent={item.label}
								size="lg"
								class={active ? 'border-l-2 border-l-sidebar-primary rounded-l-none pl-[calc(var(--spacing)*3-2px)]' : 'border-l-2 border-l-transparent rounded-l-none pl-[calc(var(--spacing)*3-2px)]'}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon class="size-5" />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.SidebarMenuButton>
						</Sidebar.SidebarMenuItem>
					{/each}
				</Sidebar.SidebarMenu>
			</Sidebar.SidebarGroupContent>
		</Sidebar.SidebarGroup>
	</Sidebar.SidebarContent>

	<Sidebar.SidebarFooter class="border-t border-border px-4 py-4">
		<Sidebar.SidebarMenu>
			<Sidebar.SidebarMenuItem>
				<Sidebar.SidebarMenuButton tooltipContent="Back to Storefront" size="lg" class="border-l-2 border-l-transparent rounded-l-none pl-[calc(var(--spacing)*3-2px)]">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<ArrowLeftIcon class="size-5" />
							<span>Back to Storefront</span>
						</a>
					{/snippet}
				</Sidebar.SidebarMenuButton>
			</Sidebar.SidebarMenuItem>
		</Sidebar.SidebarMenu>
	</Sidebar.SidebarFooter>
</Sidebar.Sidebar>
