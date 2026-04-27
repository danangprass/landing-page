<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { setAuthContext } from '$lib/stores/auth.svelte';
  import { setCartContext } from '$lib/stores/cart.svelte';
  import { setWishlistContext } from '$lib/stores/wishlist.svelte';
  import { setProductsContext } from '$lib/stores/products.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { getToasts, dismissToast } from '$lib/pb-error-handler.svelte';

  let { children } = $props();

  const auth = setAuthContext();
  const cart = setCartContext();
  const wishlist = setWishlistContext();
  const products = setProductsContext();

  // Load cart always (localStorage for anonymous, server for authenticated)
  // and wishlist when user logs in
  $effect(() => {
    cart.load();
    if (auth.isLoggedIn) {
      wishlist.load();
      cart.subscribeRealtime();
      wishlist.subscribeRealtime();
    } else {
      cart.unsubscribeRealtime();
      wishlist.unsubscribeRealtime();
    }

    return () => {
      cart.unsubscribeRealtime();
      wishlist.unsubscribeRealtime();
    };
  });
</script>

<div class="min-h-screen flex flex-col bg-bg text-text-primary">
  <Navbar />
  <main class="flex-1 pt-12">
    {@render children()}
  </main>
  <Footer />
</div>

<!-- Global toast notifications -->
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
  {#each getToasts() as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onDismiss={() => dismissToast(toast.id)}
    />
  {/each}
</div>