<script lang="ts">
  import { goto } from '$app/navigation';
  import { getCartContext } from '$lib/stores/cart.svelte';
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import type { ExpandedProduct } from '$lib/pb-types-ext';

  const auth = getAuthContext();
  $effect(() => { if (!auth.isLoggedIn) goto('/login?redirect=' + encodeURIComponent('/checkout')); });

  const cart = getCartContext();

  const STEP_LABELS = ['Shipping', 'Payment', 'Review'] as const;

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

  // Payment form state
  let cardNumber = $state('');
  let expiry = $state('');
  let cvv = $state('');

  // Review state
  let agreedToTerms = $state(false);

  // Validation errors
  let errors = $state<Record<string, string>>({});

  // Track which step we're animating FROM for CSS transitions
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

  function luhnCheck(num: string): boolean {
    const digits = num.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (alternate) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  function validatePayment(): boolean {
    const e: Record<string, string> = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard) {
      e.cardNumber = 'Card number is required';
    } else if (!luhnCheck(rawCard)) {
      e.cardNumber = 'Invalid card number';
    }
    if (!expiry.trim()) {
      e.expiry = 'Expiry date is required';
    } else {
      const match = expiry.match(/^(\d{2})\/(\d{2})$/);
      if (!match) {
        e.expiry = 'Use MM/YY format';
      } else {
        const mm = parseInt(match[1], 10);
        const yy = parseInt(match[2], 10);
        if (mm < 1 || mm > 12) {
          e.expiry = 'Invalid month';
        } else {
          const now = new Date();
          const expDate = new Date(2000 + yy, mm);
          if (expDate <= now) {
            e.expiry = 'Card has expired';
          }
        }
      }
    }
    if (!cvv.trim()) {
      e.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv.trim())) {
      e.cvv = 'CVV must be 3 or 4 digits';
    }
    errors = e;
    return Object.keys(e).length === 0;
  }

  function transitionToStep(step: number) {
    if (transitioning) return;
    previousStep = currentStep;
    transitioning = true;
    // Let exit animation run, then switch
    setTimeout(() => {
      currentStep = step;
      errors = {};
      transitioning = false;
    }, 150);
  }

  function handleContinueToPayment() {
    if (validateShipping()) {
      transitionToStep(2);
    }
  }

  function handleContinueToReview() {
    if (validatePayment()) {
      transitionToStep(3);
    }
  }

  function goBack(step: number) {
    previousStep = currentStep;
    currentStep = step;
    errors = {};
  }

  function handlePlaceOrder() {
    if (!agreedToTerms) return;
    orderPlaced = true;
    cart.clear();
  }

  let selectedShippingPrice = $derived(
    SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price ?? 0
  );

  let tax = $derived(Number((cart.subtotal * 0.08).toFixed(2)));
  let total = $derived(
    Number((cart.subtotal + selectedShippingPrice + tax).toFixed(2))
  );

  let maskedCard = $derived('**** **** **** ' + cardNumber.replace(/\s/g, '').slice(-4));

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  }
</script>

{#if orderPlaced}
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
      <a href="/" class="btn-primary inline-block">Continue Shopping</a>
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
          <!-- Step circle and label -->
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
          <!-- Connector line -->
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
              <!-- Full Name -->
              <div>
                <label for="fullName" class="field-label">Full Name <span class="text-error">*</span></label>
                <input
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

              <!-- Address Line 1 -->
              <div>
                <label for="address1" class="field-label">Address Line 1 <span class="text-error">*</span></label>
                <input
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

              <!-- Address Line 2 -->
              <div>
                <label for="address2" class="field-label">Address Line 2</label>
                <input
                  id="address2"
                  type="text"
                  bind:value={address2}
                  class="field-input"
                  placeholder="Apt, Suite, Unit (optional)"
                />
              </div>

              <!-- City + State -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="city" class="field-label">City <span class="text-error">*</span></label>
                  <input
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
                  <label for="state" class="field-label">State/Province <span class="text-error">*</span></label>
                  <input
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

              <!-- ZIP + Country -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="zip" class="field-label">ZIP/Postal Code <span class="text-error">*</span></label>
                  <input
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
                  <label for="country" class="field-label">Country <span class="text-error">*</span></label>
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

              <!-- Phone -->
              <div>
                <label for="phone" class="field-label">Phone <span class="text-error">*</span></label>
                <input
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
                      {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                    </span>
                  </label>
                {/each}
              </div>
            </div>

            <div class="flex justify-end">
              <button class="btn-primary" onclick={handleContinueToPayment}>
                Continue to Payment
              </button>
            </div>
          </div>
        </div>

      {:else if currentStep === 2}
        <!-- Step 2: Payment -->
        <div class="step-content" class:exiting={transitioning && currentStep !== 2}>
          <div class="space-y-8">
            <h2 class="text-2xl font-semibold text-text-primary">Payment Method</h2>

            <div class="demo-payment-notice" role="note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="demo-notice-icon" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span><strong>Demo store</strong> — this is a mock payment form. Enter any test values; no real card data is processed or stored.</span>
            </div>

            <div class="form-card">
              <!-- Card Number -->
              <div>
                <label for="cardNumber" class="field-label">Card Number <span class="text-error">*</span></label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  oninput={(e: Event) => { cardNumber = (e.target as HTMLInputElement).value.replace(/\s/g, ''); }}
                  class="field-input"
                  placeholder="4242 4242 4242 4242"
                  maxlength={19}
                  autocomplete="off"
                />
                {#if errors.cardNumber}
                  <p class="field-error">{errors.cardNumber}</p>
                {/if}
              </div>

              <!-- Expiry + CVV -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label for="expiry" class="field-label">Expiry MM/YY <span class="text-error">*</span></label>
                  <input
                    id="expiry"
                    type="text"
                    value={formatExpiry(expiry)}
                    oninput={(e: Event) => { expiry = (e.target as HTMLInputElement).value.replace(/\D/g, ''); }}
                    class="field-input"
                    placeholder="MM/YY"
                    maxlength={5}
                    autocomplete="off"
                  />
                  {#if errors.expiry}
                    <p class="field-error">{errors.expiry}</p>
                  {/if}
                </div>
                <div>
                  <label for="cvv" class="field-label">CVV <span class="text-error">*</span></label>
                  <input
                    id="cvv"
                    type="text"
                    bind:value={cvv}
                    class="field-input"
                    placeholder="123"
                    maxlength={4}
                    autocomplete="off"
                  />
                  {#if errors.cvv}
                    <p class="field-error">{errors.cvv}</p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Alternative payment methods -->
            <div>
              <div class="relative flex items-center justify-center my-6">
                <div class="border-t border-border w-full"></div>
                <span class="bg-bg px-4 text-sm text-text-secondary absolute">Or pay with</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  class="alt-pay-btn"
                  onclick={() => {}}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.31 16.67 21 15.43 21C13.43 21 12.43 19.5 12.43 17.5C12.43 15.5 14.43 13.5 16.43 13.5C17.43 13.5 18.43 14 18.93 14.5L17.43 16C17.13 15.69 16.83 15.5 16.43 15.5C15.63 15.5 14.93 16.4 14.93 17.5C14.93 18.6 15.63 19.5 16.43 19.5C17.03 19.5 17.63 19.1 17.93 18.6L18.71 19.5ZM12.43 3C7.43 3 3.43 7 3.43 12C3.43 17 7.43 21 12.43 21C13.43 21 14.43 20.8 15.33 20.5C14.03 19.4 13.43 17.5 13.43 17.5C13.43 15.5 14.43 13.5 16.43 13.5C17.63 13.5 18.63 14.1 19.33 15.1C19.73 14.1 19.93 13.1 19.93 12C19.93 7 15.93 3 12.43 3Z"/>
                  </svg>
                  Pay
                </button>
                <button
                  type="button"
                  class="alt-pay-btn"
                  onclick={() => {}}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.086 15.479 0 12.24 0 5.555 0 .24 5.314.24 12s5.315 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.989-.085-1.785-.255-2.569H12.24z"/>
                  </svg>
                  Pay
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button
                type="button"
                class="back-link"
                onclick={() => goBack(1)}
              >
                &larr; Back to Shipping
              </button>
              <button class="btn-primary" onclick={handleContinueToReview}>
                Continue to Review
              </button>
            </div>
          </div>
        </div>

      {:else}
        <!-- Step 3: Review -->
        <div class="step-content" class:exiting={transitioning && currentStep !== 3}>
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
                    <span class="text-text-primary font-semibold shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
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
                    {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                    ({method.description})
                  </p>
                {/if}
              {/each}
            </div>

            <!-- Payment Method -->
            <div class="review-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-text-primary">Payment Method</h3>
                <button
                  type="button"
                  class="edit-link"
                  onclick={() => goBack(2)}
                >
                  Edit
                </button>
              </div>
              <p class="text-text-secondary">{maskedCard}</p>
            </div>

            <!-- Totals -->
            <div class="review-card">
              <div class="space-y-3">
                <div class="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{selectedShippingPrice === 0 ? 'Free' : `$${selectedShippingPrice.toFixed(2)}`}</span>
                </div>
                <div class="flex justify-between text-text-secondary">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div class="border-t border-border my-2"></div>
                <div class="flex justify-between text-text-primary text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Terms checkbox -->
            <label class="terms-label">
              <div class="relative mt-0.5">
                <input
                  type="checkbox"
                  bind:checked={agreedToTerms}
                  class="peer sr-only"
                />
                <div class="checkbox-box">
                  {#if agreedToTerms}
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </div>
              </div>
              <span class="text-sm text-text-secondary">
                I agree to the <a href="/terms" class="terms-link">Terms of Service</a>
              </span>
            </label>

            <button
              class="btn-primary w-full"
              disabled={!agreedToTerms}
              class:disabled-btn={!agreedToTerms}
              onclick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Success state: enter with scale(0.95) + opacity, never scale(0) */
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

  @keyframes success-enter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Stepper */
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

  /* Step content: CSS transitions for interruptible step changes */
  .step-content {
    transition:
      opacity 300ms var(--ease-in-out),
      transform 300ms var(--ease-in-out);
  }
  .step-content.exiting {
    opacity: 0;
    transform: scale(0.95);
  }

  /* Demo payment notice */
  .demo-payment-notice {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: rgba(255, 204, 0, 0.08);
    border: 1px solid rgba(255, 204, 0, 0.25);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
  .demo-notice-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: rgba(255, 204, 0, 0.8);
  }

  /* Form card */
  .form-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Form field labels */
  .field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 0.375rem;
  }

  /* Design engineering form input spec */
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
  /* Focus-visible for keyboard users */
  .field-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Field error */
  .field-error {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-error);
  }

  /* Radio card: scale-on-press */
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

  /* Custom radio circle */
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

  /* Alternative payment buttons: press feedback */
  .alt-pay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    color: var(--color-text-primary);
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);
  }
  .alt-pay-btn:active {
    transform: scale(0.97);
  }
  @media (hover: hover) and (pointer: fine) {
    .alt-pay-btn:hover {
      border-color: var(--color-accent);
    }
  }

  /* Back link: press feedback */
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

  /* Review card */
  .review-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
  }

  /* Review emoji */
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

  /* Edit link: press feedback */
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

  /* Terms label */
  .terms-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
  }

  /* Custom checkbox */
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

  /* Terms link */
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

  /* Disabled button state */
  .disabled-btn {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>