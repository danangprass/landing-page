<script lang="ts">
  import { getCartContext } from '$lib/stores/cart.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import QuantityStepper from '$lib/components/QuantityStepper.svelte';
  import Breadcrumb from '$lib/components/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/components/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/components/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/components/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/components/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/components/ui/breadcrumb/breadcrumb-separator.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import { toast } from 'svelte-sonner';

  const cart = getCartContext();

  let promoCode = $state('');

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

  function formatPrice(dollars: number): string {
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  let tax = $derived(Math.round(cart.subtotal * 0.08));
  let total = $derived(cart.subtotal + tax);

  function handleRemove(cartItemId: string, name: string) {
    cart.remove(cartItemId);
    toast(`${name} removed from bag`);
  }

  function handleQuantityChange(cartItemId: string, quantity: number) {
    cart.updateQuantity(cartItemId, quantity);
  }
</script>

<svelte:head>
  <title>Your Bag | ElectraStore</title>
  <meta name="description" content="Review items in your shopping bag." />
</svelte:head>

<div class="section-padding">
  <!-- Breadcrumb -->
  <div class="py-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Bag</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

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
      <Button href="/products">Continue Shopping</Button>
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
                  <Button
                    variant="ghost"
                    class="remove-btn"
                    onclick={() => handleRemove(item.id, item.product.name)}
                    aria-label="Remove {item.product.name} from bag"
                  >
                    <span class="hidden md:inline">Remove</span>
                    <span class="md:hidden text-lg">&times;</span>
                  </Button>
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
        <div class="sticky top-24">
          <Card.Root>
            <Card.Header>
              <Card.Title>Order Summary</Card.Title>
            </Card.Header>
            <Card.Content>
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

              <Button href="/checkout" class="w-full mt-6">Checkout</Button>
            </Card.Content>
            <Card.Content class="pt-0">
              <Accordion.Root type="single">
                <Accordion.Item value="promo">
                  <Accordion.Trigger>Have a promo code?</Accordion.Trigger>
                  <Accordion.Content>
                    <div class="flex gap-2 pt-2">
                      <Input type="text" bind:value={promoCode} placeholder="Enter promo code" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
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

  .cart-item {
    display: flex;
    gap: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    transition: opacity 250ms var(--ease-out), transform 250ms var(--ease-out);
  }
  @media (min-width: 768px) {
    .cart-item { gap: 1.5rem; }
  }
  .cart-item:first-child { padding-top: 0; }

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
    .item-emoji { width: 7rem; height: 7rem; font-size: 2.25rem; }
  }

  .item-link {
    color: var(--color-text-primary);
    text-decoration: none;
    transition: color 160ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .item-link:hover { color: var(--color-accent); }
  }

  .remove-btn {
    color: var(--color-error);
    font-size: 0.875rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0;
    transition: transform 160ms var(--ease-out), color 200ms var(--ease-out), opacity 200ms var(--ease-out);
  }
  .remove-btn:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) {
    .remove-btn:hover { color: var(--color-accent-hover); }
  }

  .back-link {
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 160ms var(--ease-out), transform 160ms var(--ease-out);
  }
  .back-link:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) {
    .back-link:hover { color: var(--color-accent-hover); }
  }
</style>