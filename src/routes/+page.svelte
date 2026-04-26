<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';

  const store = getProductsContext();

  $effect(() => {
    store.loadFeatured();
    store.loadCategories();
    store.loadBanners();
    store.loadTestimonials();
  });

  const heroProduct = $derived(store.products[0]);
  const featured = $derived(store.products.slice(0, 6));
  const categories = $derived(store.categories.slice(0, 6));

  function formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }

  /* ── Scroll-triggered reveal ── */
  $effect(() => {
    // Re-run when PB data loads and new DOM elements appear
    store.products;
    store.categories;

    // Hero clip-reveal: remove 'hidden' class with stagger
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const clipEls = document.querySelectorAll('.clip-reveal.hidden');
    clipEls.forEach((el, i) => {
      const id = setTimeout(() => el.classList.remove('hidden'), i * 150 + 100);
      timeouts.push(id);
    });

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
      timeouts.forEach(clearTimeout);
      observer.disconnect();
    };
  });

  /* ── Category icons (SVG) ── */
  const categoryIcons: Record<string, string> = {
    smartphones: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
    laptops: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>',
    audio: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v3a2 2 0 0 0 2 2h7v-5H3Z"/><path d="M3 14V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M21 20v-2"/></svg>',
    wearables: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a6 6 0 0 0-6 6c0 2.2-.7 4.2-2 6"/><path d="M12 2a6 6 0 0 1 6 6c0 2.2.7 4.2 2 6"/><path d="M12 14a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z"/><path d="M10 20v3"/><path d="M14 20v3"/></svg>',
    gaming: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>',
    accessories: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="10"/></svg>',
  };

  const valueProps = [
    {
      title: 'Premium Selection',
      desc: 'Curated electronics from the world\'s leading brands, hand-picked for quality and performance.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>'
    },
    {
      title: 'Fast Delivery',
      desc: 'Free express shipping on orders over $99. Track your package in real-time from checkout to doorstep.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>'
    },
    {
      title: '2-Year Warranty',
      desc: 'Every device is covered. If anything goes wrong, we\'ll repair or replace it — no questions asked.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    }
  ];
</script>

<svelte:head>
  <title>RuFlo — Premium Electronics</title>
  <meta name="description" content="Discover cutting-edge smartphones, laptops, audio, and wearables. Premium tech, curated for you." />
</svelte:head>

<!-- ============================================================
     HERO SECTION
     Full viewport, animated mesh gradient, glass overlay
     ============================================================ -->
{#if heroProduct}
<section class="hero">
  <div class="hero-mesh" aria-hidden="true"></div>
  <div class="hero-glow" aria-hidden="true"></div>

  <div class="hero-content">
    <span class="hero-badge clip-reveal hidden" style="--stagger-index: 0;">
      New Arrival
    </span>

    <h1 class="hero-title clip-reveal hidden" style="--stagger-index: 1;">
      {heroProduct.name}
    </h1>

    <p class="hero-subtitle clip-reveal hidden" style="--stagger-index: 2;">
      {heroProduct.description}
    </p>

    <p class="hero-price clip-reveal hidden" style="--stagger-index: 3;">
      From {formatPrice(heroProduct.price)}
    </p>

    <div class="hero-actions reveal" style="--stagger-index: 4;">
      <a href="/products/{heroProduct.slug}" class="btn-primary">Learn more</a>
      <a href="/products/{heroProduct.slug}" class="btn-secondary">Buy</a>
    </div>
  </div>

  <!-- Scroll hint -->
  <div class="scroll-hint" aria-hidden="true">
    <div class="scroll-mouse">
      <div class="scroll-wheel"></div>
    </div>
  </div>
</section>
{/if}

<!-- ============================================================
     FEATURED PRODUCTS — BENTO GRID
     2 large spotlight cards + 4 standard cards
     ============================================================ -->
{#if featured.length > 0}
<section class="section-padding section-vertical">
  <div class="reveal section-header">
    <h2 class="section-heading">Featured</h2>
    <a href="/products" class="section-link">View all</a>
  </div>

  <div class="bento-grid">
    {#each featured as product, i (product.id)}
      <div class="reveal bento-item" class:bento-large={i < 2} style="--stagger-index: {i};">
        <ProductCard {product} />
      </div>
    {/each}
  </div>
</section>
{/if}

<!-- ============================================================
     CATEGORY PILLS
     Horizontal scroll with glass tiles
     ============================================================ -->
{#if categories.length > 0}
<section class="section-padding section-vertical">
  <h2 class="reveal section-heading">Browse by Category</h2>

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
     VALUE PROPOSITIONS
     3 glass cards in a row
     ============================================================ -->
<section class="section-padding section-vertical">
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
     Full-width glass panel with strong CTA
     ============================================================ -->
<section class="section-padding section-vertical">
  <div class="cta-banner reveal">
    <div class="cta-glow" aria-hidden="true"></div>
    <h2 class="cta-heading">Ready to upgrade?</h2>
    <p class="cta-subtitle">Discover the full collection of premium devices.</p>
    <a href="/products" class="btn-primary">Explore all products</a>
  </div>
</section>

<style>
  /* ── HERO ── */
  .hero {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-align: center;
    background-color: var(--color-bg);
  }

  .hero-mesh {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 40%, rgba(41, 151, 255, 0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 60%, rgba(168, 85, 247, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse 50% 50% at 50% 100%, rgba(41, 151, 255, 0.04) 0%, transparent 50%);
    pointer-events: none;
    animation: mesh-shift 12s ease-in-out infinite alternate;
  }

  .hero-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 30%, rgba(41, 151, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  @keyframes mesh-shift {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-2%, 2%) scale(1.05); }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 56rem;
    padding: 0 1.5rem;
  }

  .hero-badge {
    display: inline-block;
    padding: 0.375rem 1rem;
    border-radius: var(--radius-full);
    background: rgba(41, 151, 255, 0.12);
    border: 1px solid rgba(41, 151, 255, 0.2);
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(8px);
  }

  .hero-title {
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.03em;
    line-height: 1.05;
    text-wrap: balance;
  }

  .hero-subtitle {
    margin-top: 1.25rem;
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    color: var(--color-text-secondary);
    max-width: 42rem;
    line-height: 1.5;
    text-wrap: pretty;
  }

  .hero-price {
    margin-top: 1rem;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2.5rem;
  }

  /* Scroll hint */
  .scroll-hint {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.4;
    animation: fade-in-up 1s var(--ease-out) 1.5s both;
  }

  .scroll-mouse {
    width: 1.5rem;
    height: 2.25rem;
    border: 2px solid var(--color-text-secondary);
    border-radius: 9999px;
    position: relative;
  }

  .scroll-wheel {
    width: 4px;
    height: 6px;
    background: var(--color-text-secondary);
    border-radius: 2px;
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    animation: scroll-wheel 1.5s ease-in-out infinite;
  }

  @keyframes scroll-wheel {
    0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
    50% { opacity: 0.3; transform: translateX(-50%) translateY(6px); }
  }

  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 0.4; transform: translateY(0); }
  }

  /* ── SECTION HEADER ── */
  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .section-link {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-accent);
    text-decoration: none;
    transition: color 160ms var(--ease-out);
    white-space: nowrap;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 9rem;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    text-decoration: none;
    scroll-snap-align: start;
    flex-shrink: 0;
    transition: transform 160ms var(--ease-out), box-shadow 250ms var(--ease-out), background 250ms var(--ease-out);
  }

  .category-tile:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .category-tile:hover {
      transform: translateY(-2px);
      background: var(--color-surface-hover);
      box-shadow: var(--shadow-elevated);
    }
  }

  .category-icon-wrap {
    color: var(--color-text-secondary);
    transition: color 250ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .category-tile:hover .category-icon-wrap {
      color: var(--color-text-primary);
    }
  }

  .category-name {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  /* ── VALUE PROPS ── */
  .value-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .value-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .value-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out), background 250ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .value-card:hover {
      transform: translateY(-2px);
      background: var(--color-surface-hover);
      box-shadow: var(--shadow-elevated);
    }
  }

  .value-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-md);
    background: rgba(41, 151, 255, 0.1);
    color: var(--color-accent);
    margin-bottom: 1.25rem;
  }

  .value-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .value-desc {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    text-wrap: pretty;
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
    margin-top: 0.75rem;
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 28rem;
    line-height: 1.5;
  }

  .cta-banner .btn-primary {
    position: relative;
    margin-top: 2rem;
  }

  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce) {
    .hero-mesh,
    .scroll-hint,
    .scroll-wheel {
      animation: none;
    }
  }
</style>
