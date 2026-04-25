<script lang="ts">
  import { getCartContext } from '$lib/stores/cart.svelte';
  import QuantityStepper from '$lib/components/QuantityStepper.svelte';

  const cart = getCartContext();

  let promoOpen = $state(false);
  let promoCode = $state('');
  let toastMessage = $state('');
  let toastVisible = $state(false);
  let toastTimer: ReturnType<typeof setTimeout>;

  const categoryEmojis: Record<string, string> = {
    phones: '\u{1F4F1}',
    laptops: '\u{1F4BB}',
    audio: '\u{1F3A7}',
    wearables: '\u{231A}',
    accessories: '\u{1F50C}'
  };

  function getEmoji(categorySlug: string): string {
    return categoryEmojis[categorySlug] ?? '\u{1F4E6}';
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  let tax = $derived(Math.round(cart.subtotal * 0.08));
  let total = $derived(cart.subtotal + tax);

  function showToast(message: string) {
    toastMessage = message;
    toastVisible = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible = false;
    }, 2400);
  }

  function handleRemove(cartItemId: string, name: string) {
    cart.remove(cartItemId);
    showToast(`${name} removed from bag`);
  }

  function handleQuantityChange(cartItemId: string, quantity: number) {
    cart.updateQuantity(cartItemId, quantity);
  }
</script>

<svelte:head>
  <title>Your Bag | RuFlo</title>
  <meta name="description" content="Review items in your shopping bag." />
</svelte:head>

<div class="section-padding">
  <!-- Breadcrumb -->
  <nav class="py-4 text-sm text-text-secondary" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2">
      <li><a href="/" class="breadcrumb-link">Home</a></li>
      <li><span class="text-text-secondary/50">/</span></li>
      <li class="text-text-primary">Bag</li>
    </ol>
  </nav>

  <!-- Title -->
  <div class="py-8 border-b border-border">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">
      Your Bag
    </h1>
    {#if cart.count > 0}
      <p class="mt-2 text-text-secondary text-sm">
        {cart.count} item{cart.count !== 1 ? 's' : ''}
      </p>
    {/if}
  </div>

  {#if cart.items.length === 0}
    <!-- Empty state -->
    <div class="empty-state">
      <svg
        class="empty-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <p class="text-xl text-text-primary font-medium">Your bag is empty.</p>
      <p class="text-text-secondary">Looks like you haven't added anything yet.</p>
      <a href="/products" class="btn-primary">Continue Shopping</a>
    </div>
  {:else}
    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8">
      <!-- Left: Cart Items -->
      <div class="lg:w-[60%]">
        {#each cart.items as item, i (item.id)}
          <div
            class="cart-item"
            style="--stagger: {i * 60}ms"
          >
            <!-- Emoji placeholder -->
            <div class="item-emoji">
              {getEmoji(item.product.expand?.category?.slug ?? '')}
            </div>

            <!-- Item details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="text-text-primary font-semibold text-base md:text-lg leading-tight">
                    <a href="/products/{item.product.slug}" class="item-link">
                      {item.product.name}
                    </a>
                  </h3>
                  <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
                    <span>Qty {item.quantity}</span>
                  </div>
                </div>

                <!-- Unit price (desktop) -->
                <p class="hidden md:block text-text-primary font-semibold whitespace-nowrap">
                  {formatPrice(item.product.price)}
                </p>
              </div>

              <div class="mt-4 flex items-center justify-between gap-4">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(qty) => handleQuantityChange(item.id, qty)}
                />

                <div class="flex items-center gap-4">
                  <!-- Line total (mobile) -->
                  <p class="md:hidden text-text-primary font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>

                  <!-- Remove button -->
                  <button
                    class="remove-btn"
                    onclick={() => handleRemove(item.id, item.product.name)}
                    aria-label="Remove {item.product.name} from bag"
                  >
                    <span class="hidden md:inline">Remove</span>
                    <span class="md:hidden text-lg">&times;</span>
                  </button>
                </div>
              </div>

              <!-- Line total (desktop) -->
              <p class="hidden md:block mt-2 text-text-secondary text-sm">
                {formatPrice(item.product.price)} &times; {item.quantity} = {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        {/each}

        <!-- Continue shopping -->
        <div class="pt-6">
          <a href="/products" class="back-link">
            &larr; Continue Shopping
          </a>
        </div>
      </div>

      <!-- Right: Order Summary -->
      <div class="lg:w-[40%]">
        <div class="summary-card">
          <h2 class="text-lg font-semibold text-text-primary mb-6">Order Summary</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-text-secondary">Subtotal</span>
              <span class="text-text-primary">{formatPrice(cart.subtotal)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Shipping</span>
              <span class="text-success font-medium">Free</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Estimated Tax (8%)</span>
              <span class="text-text-primary">{formatPrice(tax)}</span>
            </div>
          </div>

          <div class="border-t border-border my-4"></div>

          <div class="flex justify-between items-baseline">
            <span class="text-text-primary font-semibold text-base">Total</span>
            <span class="text-text-primary font-bold text-xl">{formatPrice(total)}</span>
          </div>

          <a href="/checkout" class="btn-primary block text-center mt-6 w-full">
            Checkout
          </a>

          <!-- Promo code collapsible -->
          <div class="mt-6 border-t border-border pt-4">
            <button
              class="promo-toggle"
              onclick={() => (promoOpen = !promoOpen)}
              aria-expanded={promoOpen}
            >
              <span>Have a promo code?</span>
              <svg
                class="chevron-icon"
                class:rotated={promoOpen}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <div class="promo-body" class:open={promoOpen}>
              <div class="promo-inner">
                <input
                  type="text"
                  bind:value={promoCode}
                  placeholder="Enter promo code"
                  class="promo-input"
                />
                <button class="promo-apply-btn">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Toast notification -->
<div class="toast-container" class:visible={toastVisible}>
  <div class="toast">
    {toastMessage}
  </div>
</div>

<style>
  /* Breadcrumb link */
  .breadcrumb-link {
    transition: color 160ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .breadcrumb-link:hover {
      color: var(--color-text-primary);
    }
  }

  /* Empty state: scale(0.95) + opacity, not scale(0) */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 0;
    text-align: center;
    gap: 0.5rem;
  }
  .empty-icon {
    width: 6rem;
    height: 6rem;
    color: color-mix(in srgb, var(--color-text-secondary) 40%, transparent);
    margin-bottom: 1.5rem;
  }

  /* Cart item row */
  .cart-item {
    display: flex;
    gap: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    transition:
      opacity 250ms var(--ease-out),
      transform 250ms var(--ease-out);
  }
  @media (min-width: 768px) {
    .cart-item {
      gap: 1.5rem;
    }
  }
  .cart-item:first-child {
    padding-top: 0;
  }

  /* Item emoji */
  .item-emoji {
    width: 5rem;
    height: 5rem;
    flex-shrink: 0;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
  }
  @media (min-width: 768px) {
    .item-emoji {
      width: 7rem;
      height: 7rem;
      font-size: 2.25rem;
    }
  }

  /* Item link */
  .item-link {
    color: var(--color-text-primary);
    text-decoration: none;
    transition: color 160ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .item-link:hover {
      color: var(--color-accent);
    }
  }

  /* Remove button: press feedback */
  .remove-btn {
    color: var(--color-error);
    font-size: 0.875rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0;
    transition:
      transform 160ms var(--ease-out),
      color 200ms var(--ease-out),
      opacity 200ms var(--ease-out);
  }
  .remove-btn:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .remove-btn:hover {
      color: var(--color-accent-hover);
    }
  }

  /* Back link */
  .back-link {
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      color 160ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .back-link:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .back-link:hover {
      color: var(--color-accent-hover);
    }
  }

  /* Summary card: sticky, with shadow on hover for pointer */
  .summary-card {
    position: sticky;
    top: 6rem;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    transition:
      box-shadow 250ms var(--ease-out),
      transform 250ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .summary-card:hover {
      box-shadow: var(--shadow-elevated);
      transform: translateY(-1px);
    }
  }

  /* Promo toggle button: press feedback */
  .promo-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition:
      color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .promo-toggle:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .promo-toggle:hover {
      color: var(--color-text-primary);
    }
  }

  /* Chevron rotation with proper easing for on-screen movement */
  .chevron-icon {
    width: 1rem;
    height: 1rem;
    transition: transform 200ms var(--ease-in-out);
  }
  .chevron-icon.rotated {
    transform: rotate(180deg);
  }

  /* Promo body: CSS transition, not keyframes — interruptible */
  .promo-body {
    display: grid;
    grid-template-rows: 0fr;
    transition:
      grid-template-rows 250ms var(--ease-in-out),
      opacity 250ms var(--ease-out);
    opacity: 0;
  }
  .promo-body.open {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .promo-inner {
    overflow: hidden;
    padding-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }

  /* Promo input: design engineering form input spec */
  .promo-input {
    flex: 1;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    transition: border-color 160ms var(--ease-out);
  }
  .promo-input::placeholder {
    color: color-mix(in srgb, var(--color-text-secondary) 50%, transparent);
  }
  .promo-input:focus {
    border-color: var(--color-accent);
    outline: none;
  }

  /* Promo apply button: press feedback */
  .promo-apply-btn {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition:
      background-color 200ms var(--ease-out),
      color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .promo-apply-btn:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .promo-apply-btn:hover {
      background: var(--color-accent);
      color: var(--color-bg);
    }
  }

  /* Toast: enters from bottom with ease-out, 400ms */
  .toast-container {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100%);
    z-index: 100;
    transition: transform 400ms var(--ease-out);
    pointer-events: none;
  }
  .toast-container.visible {
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
  .toast {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: var(--shadow-elevated);
    white-space: nowrap;
  }
</style>