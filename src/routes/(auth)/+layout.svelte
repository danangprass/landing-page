<script lang="ts">
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import LoaderIcon from '@lucide/svelte/icons/loader';

  let { children } = $props();
  let auth = getAuthContext();

  $effect(() => {
    if (!auth.isLoggedIn && !auth.loading) {
      const returnUrl = encodeURIComponent(page.url.pathname);
      goto(`/login?redirect=${returnUrl}`);
    }
  });
</script>

<svelte:head>
  {#if (page.data as Record<string, string>)?._title}
    <title>{(page.data as Record<string, string>)._title}</title>
  {/if}
</svelte:head>

{#if auth.isLoggedIn || auth.loading}
  {@render children()}
{:else}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <LoaderIcon class="size-8 animate-spin text-[var(--color-accent)]" />
      <p class="mt-4 text-[var(--color-text-secondary)]">Redirecting to sign in...</p>
    </div>
  </div>
{/if}