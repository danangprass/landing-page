<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
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
  import MenuIcon from '@lucide/svelte/icons/menu';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

  let { children } = $props();

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

  let mobileNavOpen = $state(false);
  let pathname = $derived(page.url.pathname);

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }
</script>

<div class="min-h-screen bg-[#000] flex dark">
  <!-- Sidebar overlay for mobile -->
  {#if mobileNavOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      onclick={() => (mobileNavOpen = false)}
    ></div>
  {/if}

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-50 w-60 h-full bg-[#1d1d1f] border-r border-[#424245] transform transition-transform duration-300 lg:translate-x-0 {mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col"
  >
    <div class="px-5 py-5 border-b border-[#424245]">
      <a href="/" class="text-lg font-semibold text-[#f5f5f7] hover:text-[#2997ff] transition-colors">
        ElectraStore
      </a>
      <p class="text-xs text-[#86868b] mt-0.5">Admin Panel</p>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors {isActive(item.href) ? 'bg-[#2997ff]/15 text-[#2997ff]' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
          onclick={() => (mobileNavOpen = false)}
        >
          <item.icon class="w-5 h-5 shrink-0" />
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="px-4 py-4 border-t border-[#424245]">
      <a
        href="/"
        class="flex items-center gap-2 text-sm text-[#86868b] hover:text-[#f5f5f7] transition-colors"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        Back to Storefront
      </a>
    </div>
  </aside>

  <!-- Main content -->
  <div class="flex-1 lg:ml-60">
    <!-- Top bar -->
    <header class="sticky top-0 z-30 bg-[#000]/80 backdrop-blur-xl border-b border-[#424245]">
      <div class="flex items-center justify-between px-4 lg:px-8 h-14">
        <Button
          variant="ghost"
          size="icon"
          class="lg:hidden text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]"
          onclick={() => (mobileNavOpen = true)}
          aria-label="Open sidebar"
        >
          <MenuIcon class="w-5 h-5" />
        </Button>

        <div class="flex items-center gap-4 ml-auto">
          {#if page.data?.user}
            <div class="flex items-center gap-2">
              <span class="text-sm text-[#86868b]">{page.data.user.name}</span>
              <Badge variant="outline" class={page.data.user.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}>{page.data.user.role}</Badge>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="p-4 lg:p-8">
      {@render children()}
    </main>
  </div>
</div>
