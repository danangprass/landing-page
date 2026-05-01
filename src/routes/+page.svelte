<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { getImageUrl } from '$lib/pb';
  import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
  import LaptopIcon from '@lucide/svelte/icons/laptop';
  import HeadphonesIcon from '@lucide/svelte/icons/headphones';
  import WatchIcon from '@lucide/svelte/icons/watch';
  import GamepadIcon from '@lucide/svelte/icons/gamepad';
  import CableIcon from '@lucide/svelte/icons/cable';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import TruckIcon from '@lucide/svelte/icons/truck';
  import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';

  const store = getProductsContext();

  $effect(() => {
    store.loadFeatured();
    store.loadCategories();
    store.loadBanners();
    store.loadTestimonials();
  });

  const newArrivals = $derived(store.products.filter(p => p.featured).slice(0, 5));
  const featured = $derived(store.products.slice(0, 6));
  const categories = $derived(store.categories.slice(0, 6));
  const highlightProduct = $derived(store.products[1]);
  const activeBanners = $derived(
    store.banners
      .filter((b) => b.active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );
  const activeTestimonials = $derived(
    store.testimonials
      .filter((t) => t.active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  function formatPrice(dollars: number): string {
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /* ── Scroll-triggered reveal ── */

  $effect(() => {
    store.products;
    store.categories;
    store.banners;
    store.testimonials;

    const els = document.querySelectorAll('.reveal:not(.visible)');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    for (const el of els) observer.observe(el);
    return () => {
      observer.disconnect();
    };
  });

</script>

<svelte:head>
  <title>RuFlo — Premium Electronics</title>
  <meta
    name="description"
    content="Discover cutting-edge smartphones, laptops, audio, and wearables. Premium tech, curated for you."
  />
</svelte:head>

<!-- ============================================================
     HERO SECTION — New Arrival Carousel
     ============================================================ -->
{#if newArrivals.length > 0}
  <HeroCarousel products={newArrivals} />
{/if}

<!-- ============================================================
     FEATURED PRODUCTS — BENTO GRID
     ============================================================ -->
{#if featured.length > 0}
  <section class="section-padding section-vertical">
    <div class="reveal section-header">
      <div>
        <h2 class="section-heading">Featured</h2>
        <p class="section-subtitle">Hand-picked premium devices, curated just for you.</p>
      </div>
      <Button variant="link" href="/products">View all</Button>
    </div>

    <div class="bento-grid">
      {#each featured as product, i (product.id)}
        <div
          class="reveal bento-item"
          class:bento-large={i < 2}
          style="--stagger-index: {i};"
        >
          <ProductCard {product} category={product.expand?.category} />
        </div>
      {/each}
    </div>
  </section>
{/if}

<!-- ============================================================
     CATEGORY PILLS
     ============================================================ -->
{#if categories.length > 0}
  <section class="section-padding section-vertical">
    <div class="reveal section-header">
      <div>
        <h2 class="section-heading">Browse by Category</h2>
        <p class="section-subtitle">Find exactly what you're looking for.</p>
      </div>
      <Button variant="link" href="/products">See all</Button>
    </div>

    <div class="category-scroll reveal" style="--stagger-index: 1;">
      {#each categories as category (category.id)}
        <a href="/products?category={category.slug}" class="category-tile">
          <div class="category-icon-wrap">
            {#if category.slug === 'smartphones'}<SmartphoneIcon class="size-8" />
            {:else if category.slug === 'laptops'}<LaptopIcon class="size-8" />
            {:else if category.slug === 'audio'}<HeadphonesIcon class="size-8" />
            {:else if category.slug === 'wearables'}<WatchIcon class="size-8" />
            {:else if category.slug === 'gaming'}<GamepadIcon class="size-8" />
            {:else}<CableIcon class="size-8" />{/if}
          </div>
          <span class="category-name">{category.name}</span>
        </a>
      {/each}
    </div>
  </section>
{/if}

<!-- ============================================================
     FEATURE HIGHLIGHT
     Single product spotlight with image and description
     ============================================================ -->
{#if highlightProduct}
  <section class="section-padding section-vertical feature-section">
    <div class="feature-grid">
      <div class="reveal feature-visual">
        {#if highlightProduct.images?.[0]}
          <div class="feature-image-wrap">
            <div class="feature-image-glow" aria-hidden="true"></div>
            <img
              src={getImageUrl(highlightProduct, highlightProduct.images[0])}
              alt={highlightProduct.name}
              class="feature-image"
              loading="lazy"
            />
          </div>
        {:else}
          <div class="feature-image-placeholder">
            <span class="feature-placeholder-text">{highlightProduct.name}</span>
          </div>
        {/if}
      </div>

      <div class="reveal feature-content" style="--stagger-index: 1;">
        <Badge variant="secondary">Spotlight</Badge>
        <h2 class="feature-title">{highlightProduct.name}</h2>
        <p class="feature-desc">{highlightProduct.description ?? ''}</p>
        <div class="feature-actions">
          <Button href="/products/{highlightProduct.slug}">Learn more</Button>
          <span class="feature-price">{formatPrice(highlightProduct.price)}</span>
        </div>
      </div>
    </div>
  </section>
{/if}

<!-- ============================================================
     PROMO BANNER
     ============================================================ -->
{#if activeBanners.length > 0}
  {@const banner = activeBanners[0]}
  <section class="section-padding">
    <a href={banner.link_url ?? '/products'} class="reveal promo-banner">
      <div class="promo-glow" aria-hidden="true"></div>
      <div class="promo-content">
        <h3 class="promo-title">{banner.title}</h3>
        {#if banner.subtitle}
          <p class="promo-subtitle">{banner.subtitle}</p>
        {/if}
      </div>
    </a>
  </section>
{/if}

<!-- ============================================================
     TESTIMONIALS
     ============================================================ -->
{#if activeTestimonials.length > 0}
  <section class="section-padding section-vertical">
    <div class="reveal section-header">
      <div>
        <h2 class="section-heading">What People Say</h2>
        <p class="section-subtitle">Trusted by tech enthusiasts worldwide.</p>
      </div>
    </div>
    <div class="testimonial-scroll reveal" style="--stagger-index: 1;">
      {#each activeTestimonials as t (t.id)}
        <div class="testimonial-card">
          <div class="testimonial-header">
            {#if t.avatar}
              <img
                src={getImageUrl(t, t.avatar)}
                alt={t.name}
                class="testimonial-avatar"
                loading="lazy"
              />
            {:else}
              <div class="testimonial-avatar-placeholder">{t.name.charAt(0)}</div>
            {/if}
            <div class="testimonial-meta">
              <span class="testimonial-name">{t.name}</span>
              {#if t.role}
                <span class="testimonial-role">{t.role}</span>
              {/if}
            </div>
          </div>
          {#if t.rating}
            <div class="testimonial-stars" aria-label="Rating: {t.rating} out of 5">
              {#each Array(5) as _, i}
                <span class="testimonial-star" class:filled={i < (t.rating ?? 0)}>★</span>
              {/each}
            </div>
          {/if}
          <p class="testimonial-body">{t.body}</p>
        </div>
      {/each}
    </div>
  </section>
{/if}

<!-- ============================================================
     VALUE PROPOSITIONS
     ============================================================ -->
<section class="section-padding section-vertical">
  <div class="reveal section-header">
    <div>
      <h2 class="section-heading">Why Shop With Us</h2>
      <p class="section-subtitle">Everything you need for a seamless shopping experience.</p>
    </div>
  </div>

  <div class="value-grid">
    <div class="reveal value-card" style="--stagger-index: 0;">
      <div class="value-icon">
        <SparklesIcon class="size-7" />
      </div>
      <h3 class="value-title">Premium Selection</h3>
      <p class="value-desc">Curated top-tier products hand-picked for quality and performance.</p>
    </div>
    <div class="reveal value-card" style="--stagger-index: 1;">
      <div class="value-icon">
        <TruckIcon class="size-7" />
      </div>
      <h3 class="value-title">Fast Delivery</h3>
      <p class="value-desc">Free 2-day shipping on all orders. Straight to your doorstep.</p>
    </div>
    <div class="reveal value-card" style="--stagger-index: 2;">
      <div class="value-icon">
        <ShieldCheckIcon class="size-7" />
      </div>
      <h3 class="value-title">2-Year Warranty</h3>
      <p class="value-desc">Every purchase includes our comprehensive warranty for peace of mind.</p>
    </div>
  </div>
</section>

<!-- ============================================================
     CTA BANNER
     ============================================================ -->
<section class="section-padding section-vertical">
  <div class="cta-banner reveal">
    <div class="cta-mesh" aria-hidden="true"></div>
    <div class="cta-glow" aria-hidden="true"></div>
    <h2 class="cta-heading">Ready to upgrade?</h2>
    <p class="cta-subtitle">
      Discover the full collection of premium devices, hand-picked for quality and performance.
    </p>
    <Button href="/products" class="mt-8">Explore all products</Button>
  </div>
</section>

<style>
  /* ── SECTION HEADER ── */
  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .section-subtitle {
    margin-top: 0.5rem;
    font-size: 1.0625rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    max-width: 32rem;
  }

  .section-vertical {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }

  .section-heading {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  /* ── BENTO GRID ── */
  .bento-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .bento-large {
      grid-column: span 2;
    }
  }

  @media (min-width: 1024px) {
    .bento-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .bento-large {
      grid-column: span 2;
    }
  }

  /* ── CATEGORY PILLS ── */
  .category-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    margin-inline: -1.5rem;
    padding-inline: 1.5rem;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .category-scroll::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    .category-scroll {
      margin-inline: -3rem;
      padding-inline: 3rem;
    }
  }
  @media (min-width: 1024px) {
    .category-scroll {
      margin-inline: -5rem;
      padding-inline: 5rem;
    }
  }

  .category-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 9.5rem;
    padding: 1.75rem 1.5rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    text-decoration: none;
    scroll-snap-align: start;
    flex-shrink: 0;
    overflow: hidden;
    transition: transform 200ms var(--ease-out), box-shadow 300ms var(--ease-out),
      background 300ms var(--ease-out);
  }

  .category-tile:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .category-tile:hover {
      transform: translateY(-3px);
      background: var(--color-surface-hover);
      box-shadow: var(--shadow-elevated);
    }
  }

  .category-icon-wrap {
    color: var(--color-text-secondary);
    transition: color 250ms var(--ease-out), transform 250ms var(--ease-spring);
  }

  @media (hover: hover) and (pointer: fine) {
    .category-tile:hover .category-icon-wrap {
      color: var(--color-accent);
      transform: scale(1.1);
    }
  }

  .category-name {
    margin-top: 0.875rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  /* ── FEATURE HIGHLIGHT ── */
  .feature-section {
    background: linear-gradient(180deg, transparent 0%, rgba(41, 151, 255, 0.03) 50%, transparent 100%);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;
    max-width: 72rem;
    margin: 0 auto;
  }

  @media (min-width: 1024px) {
    .feature-grid {
      grid-template-columns: 1.1fr 0.9fr;
      gap: 5rem;
    }
  }

  .feature-visual {
    position: relative;
  }

  .feature-image-wrap {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .feature-image-glow {
    position: absolute;
    inset: -10%;
    background: radial-gradient(circle at 50% 50%, rgba(41, 151, 255, 0.12) 0%, transparent 60%);
    pointer-events: none;
  }

  .feature-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border-radius: var(--radius-lg);
    position: relative;
    z-index: 1;
  }

  .feature-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 10;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .feature-placeholder-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .feature-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .feature-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-wrap: balance;
  }

  .feature-desc {
    margin-top: 1rem;
    font-size: 1.0625rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    text-wrap: pretty;
    max-width: 32rem;
  }

  .feature-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 2.5rem;
  }

  .feature-price {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  /* ── PROMO BANNER ── */
  .promo-banner {
    position: relative;
    display: block;
    text-decoration: none;
    padding: 2.5rem 2rem;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, rgba(41, 151, 255, 0.12), rgba(168, 85, 247, 0.08));
    border: 1px solid rgba(41, 151, 255, 0.2);
    overflow: hidden;
    text-align: center;
    transition: transform 200ms var(--ease-out), box-shadow 300ms var(--ease-out);
  }

  .promo-banner:active {
    transform: scale(0.98);
  }

  @media (hover: hover) and (pointer: fine) {
    .promo-banner:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-elevated);
    }
  }

  .promo-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(41, 151, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .promo-content {
    position: relative;
    z-index: 1;
  }

  .promo-title {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .promo-subtitle {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: var(--color-text-secondary);
  }

  /* ── TESTIMONIALS ── */
  .testimonial-scroll {
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    margin-inline: -1.5rem;
    padding-inline: 1.5rem;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .testimonial-scroll::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    .testimonial-scroll {
      margin-inline: -3rem;
      padding-inline: 3rem;
    }
  }
  @media (min-width: 1024px) {
    .testimonial-scroll {
      margin-inline: -5rem;
      padding-inline: 5rem;
    }
  }

  .testimonial-card {
    flex-shrink: 0;
    width: 20rem;
    padding: 1.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .testimonial-header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .testimonial-avatar {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    object-fit: cover;
    border: 1px solid var(--color-border);
  }

  .testimonial-avatar-placeholder {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
    border: 1px solid var(--color-border);
  }

  .testimonial-meta {
    display: flex;
    flex-direction: column;
  }

  .testimonial-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .testimonial-role {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .testimonial-stars {
    display: flex;
    gap: 0.125rem;
    font-size: 0.875rem;
  }

  .testimonial-star {
    color: var(--color-text-secondary);
  }
  .testimonial-star.filled {
    color: #ff9f0a;
  }

  .testimonial-body {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    text-wrap: pretty;
    font-style: italic;
  }

  /* ── VALUE PROPS ── */
  .value-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 640px) {
    .value-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.75rem;
    }
  }

  @media (min-width: 1024px) {
    .value-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
    }
  }

  .value-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.5rem 1.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out),
      background 250ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .value-card:hover {
      transform: translateY(-4px);
      background: var(--color-surface-hover);
      box-shadow: var(--shadow-elevated);
    }
  }

  .value-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-lg);
    background: rgba(41, 151, 255, 0.1);
    color: var(--color-accent);
    margin-bottom: 1.5rem;
    transition: box-shadow 250ms var(--ease-out), transform 250ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .value-card:hover .value-icon {
      box-shadow: 0 0 24px rgba(41, 151, 255, 0.18);
      transform: scale(1.05);
    }
  }

  .value-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.625rem;
  }

  .value-desc {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    text-wrap: pretty;
    max-width: 24rem;
  }

  /* ── CTA BANNER ── */
  .cta-banner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 5rem 2rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .cta-mesh {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 30% 50%, rgba(41, 151, 255, 0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 70% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 55%);
    pointer-events: none;
    animation: mesh-shift 10s ease-in-out infinite alternate;
  }

  .cta-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(41, 151, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .cta-heading {
    position: relative;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-wrap: balance;
  }

  .cta-subtitle {
    position: relative;
    margin-top: 0.875rem;
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 30rem;
    line-height: 1.5;
  }

  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce) {
    .cta-mesh {
      animation: none;
    }
  }
</style>
