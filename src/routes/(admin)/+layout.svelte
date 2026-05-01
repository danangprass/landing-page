<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import StatusBadge from '$lib/admin/StatusBadge.svelte';

  let { children } = $props();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '/admin/categories', label: 'Categories', icon: 'M7 7h-1v-1h1v1zm0 4h-1v-1h1v1zm0 4h-1v-1h1v1zm4-8h-1v-1h1v1zm0 4h-1v-1h1v1zm0 4h-1v-1h1v1zm4-8h-1v-1h1v1zm0 4h-1v-1h1v1zm0 4h-1v-1h1v1zM5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
    { href: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { href: '/admin/transactions', label: 'Transactions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { href: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/admin/reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { href: '/admin/banners', label: 'Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/admin/testimonials', label: 'Testimonials', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { href: '/admin/newsletter', label: 'Newsletter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { href: '/admin/pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
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
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
          </svg>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="px-4 py-4 border-t border-[#424245]">
      <a
        href="/"
        class="flex items-center gap-2 text-sm text-[#86868b] hover:text-[#f5f5f7] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Storefront
      </a>
    </div>
  </aside>

  <!-- Main content -->
  <div class="flex-1 lg:ml-60">
    <!-- Top bar -->
    <header class="sticky top-0 z-30 bg-[#000]/80 backdrop-blur-xl border-b border-[#424245]">
      <div class="flex items-center justify-between px-4 lg:px-8 h-14">
        <button
          class="lg:hidden p-2 rounded-lg text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f] transition-colors"
          onclick={() => (mobileNavOpen = true)}
          aria-label="Open sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex items-center gap-4 ml-auto">
          {#if page.data?.user}
            <div class="flex items-center gap-2">
              <span class="text-sm text-[#86868b]">{page.data.user.name}</span>
              <StatusBadge status={page.data.user.role} size="sm" />
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
