<script lang="ts">
  import { goto } from '$app/navigation';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
  import type { ExpandedProduct } from '$lib/pb-types-ext';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const auth = getAuthContext();
  $effect(() => { if (!auth.isLoggedIn) goto('/login?redirect=' + encodeURIComponent('/checkout')); });

  const cart = getCartContext();

  const STEP_LABELS = ['Shipping', 'Review'] as const;

  const COUNTRIES = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'South Korea',
    'Singapore',
    'India'
  ] as const;

  const SHIPPING_METHODS = [
    { id: 'standard', label: 'Standard', price: 0, description: '5-7 business days' },
    { id: 'express', label: 'Express', price: 9.99, description: '2-3 business days' },
    { id: 'overnight', label: 'Overnight', price: 19.99, description: '1 business day' }
  ] as const;

  function categoryEmoji(slug: string): string {
    const map: Record<string, string> = {
      phones: '\u{1F4F1}',
      laptops: '\u{1F4BB}',
      audio: '\u{1F3A7}',
      wearables: '\u{231A}',
      accessories: '\u{1F50C}'
    };
    return map[slug] ?? '\u{1F4E6}';
  }

  function getProductCategorySlug(product: ExpandedProduct): string {
    return product.expand?.category?.slug ?? '';
  }
  function formatPrice(dollars: number): string {
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  let currentStep = $state(1);
  let orderPlaced = $state(false);
  let transitioning = $state(false);

  // Shipping form state
  let fullName = $state('');
  let address1 = $state('');
  let address2 = $state('');
  let city = $state('');
  let province = $state('');
  let zip = $state('');
  let country = $state('United States');
  let phone = $state('');
  let shippingMethod = $state('standard');

  // Review state
  let agreedToTerms = $state(false);

  // Validation errors
  let errors = $state<Record<string, string>>({});

  let previousStep = $state(1);

  function validateShipping(): boolean {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!address1.trim()) e.address1 = 'Address is required';
    if (!city.trim()) e.city = 'City is required';
    if (!province.trim()) e.province = 'State/province is required';
    if (!zip.trim()) e.zip = 'ZIP/postal code is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    errors = e;
    return Object.keys(e).length === 0;
  }

  function transitionToStep(step: number) {
    if (transitioning) return;
    previousStep = currentStep;
    transitioning = true;
    setTimeout(() => {
      currentStep = step;
      errors = {};
      transitioning = false;
    }, 150);
  }

  function handleContinueToReview() {
    if (validateShipping()) {
      transitionToStep(2);
    }
  }

  function goBack(step: number) {
    previousStep = currentStep;
    currentStep = step;
    errors = {};
  }

  let orderError = $state('');
  let orderLoading = $state(false);
  let currentOrderId = $state('');
  let paymentResult = $state<'success' | 'pending' | 'failed' | null>(null);

  async function loadSnapScript(): Promise<void> {
    if (document.getElementById('midtrans-snap')) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'midtrans-snap';
      const isSandbox = data.clientKey.startsWith('SB-');
      script.src = isSandbox
        ? 'https://app.sandbox.midtrans.com/snap/snap.js'
        : 'https://app.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', data.clientKey);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load payment script'));
      document.head.appendChild(script);
    });
  }

  async function updateOrderStatus(orderId: string, status: string, transactionId?: string) {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, transactionId }),
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  }

  async function handlePlaceOrder() {
    if (!agreedToTerms) return;
    if (!auth.user) return;
    if (cart.items.length === 0) {
      orderError = 'Your cart is empty. Please add items before checking out.';
      return;
    }
    orderError = '';
    orderLoading = true;
    try {
      const shippingAddress = `${fullName}, ${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${province} ${zip}, ${country}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          items: cart.items.map((item) => ({
            product: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message || 'Failed to place order');
      }
      const { orderId } = await res.json() as { orderId: string };
      currentOrderId = orderId;

      const snapItems = cart.items.map((item) => ({
        id: item.product.id,
        price: Math.round(item.product.price),
        quantity: item.quantity,
        name: item.product.name,
      }));
      const snapShippingPrice = Math.round(selectedShippingPrice);
      const snapTax = Math.round(cart.subtotal * 0.08);
      const snapTotal = snapItems.reduce((s, i) => s + i.price * i.quantity, 0) + snapShippingPrice + snapTax;

      const snapRes = await fetch('/api/payment/snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          total: snapTotal,
          items: [
            ...snapItems,
            ...(snapShippingPrice > 0 ? [{
              id: 'shipping',
              price: snapShippingPrice,
              quantity: 1,
              name: `Shipping — ${SHIPPING_METHODS.find(m => m.id === shippingMethod)?.label || 'Standard'}`,
            }] : []),
            {
              id: 'tax',
              price: snapTax,
              quantity: 1,
              name: 'Tax',
            },
          ],
          shippingAddress: {
            first_name: fullName.trim().split(' ')[0] || 'N/A',
            last_name: fullName.trim().split(' ').slice(1).join(' ') || undefined,
            address: address1,
            city,
            postal_code: zip,
          },
        }),
      });
      if (!snapRes.ok) throw new Error('Failed to get payment token');
      const { snapToken } = await snapRes.json() as { snapToken: string };

      await loadSnapScript();

      type SnapResult = { transaction_id?: string; payment_type?: string };
      type SnapPayOptions = {
        onSuccess?: (result: SnapResult) => void;
        onPending?: (result: SnapResult) => void;
        onError?: (result: SnapResult) => void;
        onClose?: () => void;
      };
      const snap = (window as Window & { snap?: { pay(token: string, opts: SnapPayOptions): void } }).snap;
      if (!snap) throw new Error('Snap.js failed to initialize');

      snap.pay(snapToken, {
        onSuccess: async (result) => {
          await updateOrderStatus(orderId, 'paid', result.transaction_id);
          paymentResult = 'success';
          orderPlaced = true;
          await cart.clear();
        },
        onPending: async (result) => {
          await updateOrderStatus(orderId, 'pending', result.transaction_id);
          paymentResult = 'pending';
          orderPlaced = true;
        },
        onError: async (result) => {
          await updateOrderStatus(orderId, 'failed', result.transaction_id);
          paymentResult = 'failed';
          orderError = 'Payment failed. Please try again.';
        },
        onClose: () => {
          // User dismissed popup without paying — remain on review step
        },
      });
    } catch (err: unknown) {
      console.error('Order error:', err);
      orderError = 'Failed to initiate payment. Please try again.';
    } finally {
      orderLoading = false;
    }
  }

  let selectedShippingPrice = $derived(
    SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price ?? 0
  );

  let tax = $derived(Number((cart.subtotal * 0.08).toFixed(2)));
  let total = $derived(
    Number((cart.subtotal + selectedShippingPrice + tax).toFixed(2))
  );
</script>

<svelte:head>
	<title>Checkout | ElectraStore</title>
	<meta name="description" content="Complete your order securely." />
</svelte:head>

{#if orderPlaced && paymentResult === 'success'}
  <div class="section-padding min-h-[60vh] flex items-center justify-center">
    <div class="success-container">
      <div class="success-icon-ring">
        <svg class="success-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-3xl font-semibold text-text-primary mb-3">Order Confirmed</h1>
      <p class="text-text-secondary mb-2">Thank you for your purchase! Your order has been placed successfully.</p>
      <p class="text-text-secondary mb-8">You will receive a confirmation email shortly.</p>
      <Button href="/" class="inline-block">Continue Shopping</Button>
    </div>
  </div>
{:else if orderPlaced && paymentResult === 'pending'}
  <div class="section-padding min-h-[60vh] flex items-center justify-center">
    <div class="success-container">
      <div class="pending-icon-ring">
        <svg class="w-10 h-10 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-semibold text-text-primary mb-3">Awaiting Payment</h1>
      <p class="text-text-secondary mb-2">Your order has been created. Please complete your payment.</p>
      <p class="text-text-secondary mb-8">Check your email for payment instructions.</p>
      <Button href="/" class="inline-block">Return to Home</Button>
    </div>
  </div>
{:else}
  <div class="section-padding py-8 md:py-12">
    <!-- Stepper Header -->
    <div class="stepper max-w-2xl mx-auto mb-10">
      <div class="flex items-center justify-between">
        {#each STEP_LABELS as label, i}
          {@const stepNum = i + 1}
          {@const isCompleted = currentStep > stepNum}
          {@const isActive = currentStep === stepNum}
          {@const isUpcoming = currentStep < stepNum}
          <div class="step-wrapper">
            <div
              class="step-circle"
              class:active={isActive}
              class:completed={isCompleted}
              class:upcoming={isUpcoming}
            >
              {#if isCompleted}
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {stepNum}
              {/if}
            </div>
            <span
              class="step-label"
              class:active={isActive || isCompleted}
              class:upcoming={isUpcoming}
            >
              {label}
            </span>
          </div>
          {#if i < STEP_LABELS.length - 1}
            <div class="step-line-container">
              <div
                class="step-line"
                class:filled={currentStep > stepNum}
              ></div>
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Step Content -->
    <div class="max-w-2xl mx-auto">
      {#if currentStep === 1}
        <!-- Step 1: Shipping -->
        <div class="step-content" class:exiting={transitioning && currentStep !== 1}>
          <div class="space-y-8">
            <h2 class="text-2xl font-semibold text-text-primary">Shipping Information</h2>

            <div class="form-card">
              <div>
                <Label for="fullName" class="field-label">Full Name <span class="text-error">*</span></Label>
                <Input
                  id="fullName"
                  type="text"
                  bind:value={fullName}
                  class="field-input"
                  placeholder="John Doe"
                />
                {#if errors.fullName}
                  <p class="field-error">{errors.fullName}</p>
                {/if}
              </div>

              <div>
                <Label for="address1" class="field-label">Address Line 1 <span class="text-error">*</span></Label>
                <Input
                  id="address1"
                  type="text"
                  bind:value={address1}
                  class="field-input"
                  placeholder="123 Main St"
                />
                {#if errors.address1}
                  <p class="field-error">{errors.address1}</p>
                {/if}
              </div>

              <div>
                <Label for="address2" class="field-label">Address Line 2</Label>
                <Input
                  id="address2"
                  type="text"
                  bind:value={address2}
                  class="field-input"
                  placeholder="Apt, Suite, Unit (optional)"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label for="city" class="field-label">City <span class="text-error">*</span></Label>
                  <Input
                    id="city"
                    type="text"
                    bind:value={city}
                    class="field-input"
                    placeholder="San Francisco"
                  />
                  {#if errors.city}
                    <p class="field-error">{errors.city}</p>
                  {/if}
                </div>
                <div>
                  <Label for="state" class="field-label">State/Province <span class="text-error">*</span></Label>
                  <Input
                    id="state"
                    type="text"
                    bind:value={province}
                    class="field-input"
                    placeholder="California"
                  />
                  {#if errors.province}
                    <p class="field-error">{errors.province}</p>
                  {/if}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label for="zip" class="field-label">ZIP/Postal Code <span class="text-error">*</span></Label>
                  <Input
                    id="zip"
                    type="text"
                    bind:value={zip}
                    class="field-input"
                    placeholder="94102"
                  />
                  {#if errors.zip}
                    <p class="field-error">{errors.zip}</p>
                  {/if}
                </div>
                <div>
                  <Label for="country" class="field-label">Country <span class="text-error">*</span></Label>
                  <select
                    id="country"
                    bind:value={country}
                    class="field-input appearance-none"
                  >
                    {#each COUNTRIES as c}
                      <option value={c}>{c}</option>
                    {/each}
                  </select>
                </div>
              </div>

              <div>
                <Label for="phone" class="field-label">Phone <span class="text-error">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  bind:value={phone}
                  class="field-input"
                  placeholder="(555) 123-4567"
                />
                {#if errors.phone}
                  <p class="field-error">{errors.phone}</p>
                {/if}
              </div>
            </div>

            <!-- Shipping Method -->
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-4">Shipping Method</h3>
              <div class="space-y-3">
                {#each SHIPPING_METHODS as method}
                  <label
                    class="radio-card"
                    class:selected={shippingMethod === method.id}
                  >
                    <div class="flex items-center gap-3">
                      <div class="relative">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          bind:group={shippingMethod}
                          class="peer sr-only"
                        />
                        <div class="radio-circle">
                          {#if shippingMethod === method.id}
                            <div class="radio-dot"></div>
                          {/if}
                        </div>
                      </div>
                      <div>
                        <span class="text-text-primary font-medium">{method.label}</span>
                        <span class="text-text-secondary text-sm ml-2">{method.description}</span>
                      </div>
                    </div>
                    <span class="text-text-primary font-semibold">
                      {method.price === 0 ? 'Free' : `$${method.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </span>
                  </label>
                {/each}
              </div>
            </div>

            <div class="flex justify-end">
              <Button onclick={handleContinueToReview}>
                Continue to Review
              </Button>
            </div>
          </div>
        </div>

      {:else}
        <!-- Step 2: Review -->
        <div class="step-content" class:exiting={transitioning && currentStep !== 2}>
          <div class="space-y-8">
            <h2 class="text-2xl font-semibold text-text-primary">Review Your Order</h2>

            <!-- Order Items -->
            <div class="review-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-text-primary">Order Summary</h3>
                <a href="/cart" class="edit-link">Edit Cart</a>
              </div>
              <div class="divide-y divide-border">
                {#each cart.items as item}
                  <div class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div class="review-emoji">
                      {categoryEmoji(getProductCategorySlug(item.product))}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-text-primary font-medium truncate">{item.product.name}</p>
                      <p class="text-text-secondary text-sm">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span class="text-text-primary font-semibold shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="review-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-text-primary">Shipping Address</h3>
                <button
                  type="button"
                  class="edit-link"
                  onclick={() => goBack(1)}
                >
                  Edit
                </button>
              </div>
              <p class="text-text-secondary">{fullName}</p>
              <p class="text-text-secondary">{address1}</p>
              {#if address2}
                <p class="text-text-secondary">{address2}</p>
              {/if}
              <p class="text-text-secondary">{city}, {province} {zip}</p>
              <p class="text-text-secondary">{country}</p>
              <p class="text-text-secondary">{phone}</p>
            </div>

            <!-- Shipping Method -->
            <div class="review-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-text-primary">Shipping Method</h3>
                <button
                  type="button"
                  class="edit-link"
                  onclick={() => goBack(1)}
                >
                  Edit
                </button>
              </div>
              {#each SHIPPING_METHODS as method}
                {#if method.id === shippingMethod}
                  <p class="text-text-secondary">
                    {method.label} &mdash;
                    {method.price === 0 ? 'Free' : `$${method.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    ({method.description})
                  </p>
                {/if}
              {/each}
            </div>

            <!-- Payment Method -->
            <div class="review-card">
              <h3 class="text-lg font-semibold text-text-primary mb-3">Payment</h3>
              <p class="text-text-secondary">You will be redirected to Midtrans Snap to complete your payment securely.</p>
            </div>

            <!-- Totals -->
            <div class="review-card">
              <div class="space-y-3">
                <div class="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div class="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{selectedShippingPrice === 0 ? 'Free' : `${formatPrice(selectedShippingPrice)}`}</span>
                </div>
                <div class="flex justify-between text-text-secondary">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div class="border-t border-border my-2"></div>
                <div class="flex justify-between text-text-primary text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <!-- Terms checkbox -->
            <div class="flex items-start gap-x-1">
              <label class="terms-label">
                <div class="relative mt-0.5">
                  <Checkbox bind:checked={agreedToTerms} />
                  <div class="checkbox-box">
                    {#if agreedToTerms}
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    {/if}
                  </div>
                </div>
                <span class="text-sm text-text-secondary">I agree to the</span>
              </label>
              <a href="/terms" target="_blank" rel="noopener noreferrer" class="terms-link text-sm mt-0.5">Terms of Service</a>
            </div>

            {#if orderError}
              <div class="error-notice" role="alert">
                <p class="text-sm text-[var(--color-error)]">{orderError}</p>
                {#if paymentResult === 'failed'}
                  <Button
                    class="mt-3 text-sm"
                    onclick={() => { orderError = ''; paymentResult = null; }}
                  >
                    Retry Payment
                  </Button>
                {/if}
              </div>
            {/if}

            <div class="flex items-center justify-between">
              <button
                type="button"
                class="back-link"
                onclick={() => goBack(1)}
              >
                &larr; Back to Shipping
              </button>
              <Button
                disabled={!agreedToTerms || orderLoading}
                onclick={handlePlaceOrder}
              >
                {#if orderLoading}
                  <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing…
                {:else}
                  Place Order &amp; Pay
                {/if}
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .success-container {
    text-align: center;
    max-width: 28rem;
    margin: 0 auto;
    animation: success-enter 400ms var(--ease-out) both;
  }
  .success-icon-ring {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  .success-check {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--color-accent);
  }
  .pending-icon-ring {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: rgba(255, 204, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  @keyframes success-enter {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .stepper .step-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }

  .step-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    border: 2px solid transparent;
    transition:
      background-color 300ms var(--ease-in-out),
      border-color 300ms var(--ease-in-out),
      color 300ms var(--ease-in-out);
  }
  .step-circle.active {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }
  .step-circle.completed {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }
  .step-circle.upcoming {
    background-color: transparent;
    border-color: var(--color-border);
    color: var(--color-text-secondary);
  }

  .step-label {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 300ms var(--ease-in-out);
  }
  .step-label.active {
    color: var(--color-accent);
  }
  .step-label.upcoming {
    color: var(--color-text-secondary);
  }

  .step-line-container {
    flex: 1;
    margin: 0 0.75rem;
    margin-bottom: 1.5rem;
  }
  .step-line {
    height: 2px;
    border-radius: 1px;
    background-color: var(--color-border);
    transition: background-color 300ms var(--ease-in-out);
  }
  .step-line.filled {
    background-color: var(--color-accent);
  }

  .step-content {
    transition:
      opacity 300ms var(--ease-in-out),
      transform 300ms var(--ease-in-out);
  }
  .step-content.exiting {
    opacity: 0;
    transform: scale(0.95);
  }

  .form-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 0.375rem;
  }

  .field-input {
    width: 100%;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    color: var(--color-text-primary);
    transition: border-color 160ms var(--ease-out);
  }
  .field-input::placeholder {
    color: color-mix(in srgb, var(--color-text-secondary) 50%, transparent);
  }
  .field-input:focus {
    border-color: var(--color-accent);
    outline: none;
  }
  .field-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .field-error {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-error);
  }

  .radio-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 1rem;
    cursor: pointer;
    border: 2px solid transparent;
    transition:
      border-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .radio-card:active {
    transform: scale(0.97);
  }
  .radio-card.selected {
    border-color: var(--color-accent);
  }
  @media (hover: hover) and (pointer: fine) {
    .radio-card:not(.selected):hover {
      border-color: var(--color-border);
    }
  }

  .radio-circle {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 160ms var(--ease-out);
  }
  .peer:checked ~ .radio-circle {
    border-color: var(--color-accent);
  }
  .radio-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: var(--color-accent);
    transition: transform 160ms var(--ease-out);
  }

  .back-link {
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
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

  .review-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
  }

  .review-emoji {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-sm);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .edit-link {
    font-size: 0.875rem;
    color: var(--color-accent);
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition:
      color 160ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .edit-link:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .edit-link:hover {
      color: var(--color-accent-hover);
    }
  }

  .terms-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
  }

  .checkbox-box {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 4px;
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 200ms var(--ease-out),
      border-color 200ms var(--ease-out);
  }
  .peer:checked ~ .checkbox-box {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
  }
  .peer:focus-visible ~ .checkbox-box {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .terms-link {
    color: var(--color-accent);
    text-decoration: underline;
    transition: color 160ms var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .terms-link:hover {
      color: var(--color-accent-hover);
    }
  }

  .error-notice {
    padding: 1rem;
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
    border-radius: var(--radius-sm);
  }

  .disabled-btn {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .success-container { animation: none; }
    .step-circle, .step-label, .step-line,
    .step-content, .radio-card, .back-link,
    .edit-link, .field-input, .checkbox-box { transition: none; }
  }
</style>
