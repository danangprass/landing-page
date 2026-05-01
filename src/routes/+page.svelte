<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import { getImageUrl } from '$lib/pb';

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

  /* ── Category icons (SVG) ── */
  const categoryIcons: Record<string, string> = {
    smartphones:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
    laptops:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>',
    audio:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v3a2 2 0 0 0 2 2h7v-5H3Z"/><path d="M3 14V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M21 20v-2"/></svg>',
    wearables:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a6 6 0 0 0-6 6c0 2.2-.7 4.2-2 6"/><path d="M12 2a6 6 0 0 1 6 6c0 2.2.7 4.2 2 6"/><path d="M12 14a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z"/><path d="M10 20v3"/><path d="M14 20v3"/></svg>',
    gaming:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>',
    accessories:
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="10"/></svg>',
  };

  const valueProps = [
    {
      title: 'Premium Selection',
      desc: "Curated electronics from the world's leading brands, hand-picked for quality and performance.",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
    },
    {
      title: 'Fast Delivery',
      desc: 'Free express shipping on orders over $99. Track your package in real-time from checkout to doorstep.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    },
    {
      title: '2-Year Warranty',
      desc: "Every device is covered. If anything goes wrong, we'll repair or replace it — no questions asked.",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    },
  ];
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
      <a href="/products" class="section-link">View all</a>
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
      <a href="/products" class="section-link">See all</a>
    </div>

    <div class="category-scroll reveal" style="--stagger-index: 1;">
      {#each categories as category (category.id)}
        <a href="/products?category={category.slug}" class="category-tile">
          <div class="category-icon-wrap">
            {@html categoryIcons[category.slug] ?? categoryIcons['accessories']}
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
        <span class="feature-label">Spotlight</span>
        <h2 class="feature-title">{highlightProduct.name}</h2>
        <p class="feature-desc">{highlightProduct.description ?? ''}</p>
        <div class="feature-actions">
          <a href="/products/{highlightProduct.slug}" class="btn-primary">Learn more</a>
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
    {#each valueProps as prop, i}
      <div class="reveal value-card" style="--stagger-index: {i};">
        <div class="value-icon">
          {@html prop.icon}
        </div>
        <h3 class="value-title">{prop.title}</h3>
        <p class="value-desc">{prop.desc}</p>
      </div>
    {/each}
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
    <a href="/products" class="btn-primary cta-btn">Explore all products</a>
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

  .section-link {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-accent);
    text-decoration: none;
    white-space: nowrap;
    transition: color 160ms var(--ease-out);
  }
  .section-link:hover {
    color: var(--color-accent-hover);
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

  .feature-label {
    display: inline-block;
    padding: 0.25rem 0.875rem;
    border-radius: var(--radius-full);
    background: rgba(41, 151, 255, 0.12);
    border: 1px solid rgba(41, 151, 255, 0.2);
    color: var(--color-accent);
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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

  .cta-banner .btn-primary {
    position: relative;
    margin-top: 2rem;
  }

  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce) {
    .cta-mesh {
      animation: none;
    }
  }
</style>
