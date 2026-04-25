<script lang="ts">
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let { children } = $props();
  let auth = getAuthContext();

  $effect(() => {
    if (!auth.isLoggedIn && !auth.loading) {
      const returnUrl = encodeURIComponent(page.url.pathname);
      goto(`/login?redirect=${returnUrl}`);
    }
  });
</script>

{#if auth.isLoggedIn || auth.loading}
  {@render children()}
{:else}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <div class="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-[var(--color-text-secondary)]">Redirecting to sign in...</p>
    </div>
  </div>
{/if}