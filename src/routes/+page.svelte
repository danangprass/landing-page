<script lang="ts">
  import { getProductsContext } from '$lib/stores/products.svelte';
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

  const newArrivals = $derived(store.products.filter((p) => p.featured).slice(0, 5));
  const featured = $derived(store.products.slice(0, 6));
  const categories = $derived(store.categories.slice(0, 6));
  const highlightProduct = $derived(store.products[1]);
  const activeBanners = $derived(
    store.banners
      .filter((b) => b.active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  function formatPrice(n: number): string {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function excerpt(text: string | undefined | null, max: number): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  /* Scroll-reveal observer */
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
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>RuFlo — Premium Electronics</title>
  <meta
    name="description"
    content="Discover cutting-edge smartphones, laptops, audio, and wearables. Premium tech, curated for you."
  />
</svelte:head>

<!-- ═══════════════════════════════════════
     HERO — single full-width feature tile
     ═══════════════════════════════════════ -->
{#if newArrivals.length > 0}
  {@const hero = newArrivals[0]}
  <section class="page-tiles">
    <div class="tile tile-hero">
      <a href="/products/{hero.slug}" class="tile-bg-link" aria-hidden="true" tabindex="-1"></a>
      <div class="tile-body">
        <p class="eyebrow">New</p>
        <h1 class="tile-headline tile-headline-hero">{hero.name}</h1>
        <p class="tile-subhead">{excerpt(hero.description, 80)}</p>
        <div class="tile-ctas">
          <a href="/products/{hero.slug}" class="cta-link">Learn more ›</a>
          <a href="/products/{hero.slug}" class="cta-link cta-link-muted">Shop now ›</a>
        </div>
      </div>
      <div class="tile-visual">
        {#if hero.images?.[0]}
          <img
            src={getImageUrl(hero, hero.images[0])}
            alt={hero.name}
            class="tile-img"
            loading="eager"
          />
        {:else}
          <div class="tile-img-fallback">{hero.name.charAt(0)}</div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<!-- ═══════════════════════════════════════
     PROMO GRID — 2-column pairs
     ═══════════════════════════════════════ -->
{#if featured.length >= 2}
  <section class="page-tiles page-tiles-gap">
    <div class="promo-grid">
      {#each featured.slice(0, 4) as product, i (product.id)}
        <div class="tile tile-promo reveal" style="--stagger: {i * 80}ms;">
          <a
            href="/products/{product.slug}"
            class="tile-bg-link"
            aria-hidden="true"
            tabindex="-1"
          ></a>
          <div class="tile-body">
            <h2 class="tile-headline tile-headline-md">{product.name}</h2>
            <p class="tile-subhead">{excerpt(product.description, 60)}</p>
            <div class="tile-ctas">
              <a href="/products/{product.slug}" class="cta-link">Learn more ›</a>
              <a href="/products/{product.slug}" class="cta-link cta-link-muted"
                >{formatPrice(product.price)} ›</a
              >
            </div>
          </div>
          <div class="tile-visual tile-visual-promo">
            {#if product.images?.[0]}
              <img
                src={getImageUrl(product, product.images[0])}
                alt={product.name}
                class="tile-img"
                loading="lazy"
              />
            {:else}
              <div class="tile-img-fallback">{product.name.charAt(0)}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<!-- ═══════════════════════════════════════
     CATEGORIES NAV
     ═══════════════════════════════════════ -->
{#if categories.length > 0}
  <section class="page-tiles page-tiles-gap">
    <div class="cat-section">
      <div class="cat-header reveal">
        <h2 class="section-heading">Shop by Category</h2>
      </div>
      <div class="cat-row">
        {#each categories as category (category.id)}
          <a href="/products?category={category.slug}" class="cat-tile reveal">
            <div class="cat-icon">
              {#if category.slug === 'smartphones'}<SmartphoneIcon class="icon-md" />
              {:else if category.slug === 'laptops'}<LaptopIcon class="icon-md" />
              {:else if category.slug === 'audio'}<HeadphonesIcon class="icon-md" />
              {:else if category.slug === 'wearables'}<WatchIcon class="icon-md" />
              {:else if category.slug === 'gaming'}<GamepadIcon class="icon-md" />
              {:else}<CableIcon class="icon-md" />{/if}
            </div>
            <span class="cat-name">{category.name}</span>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- ═══════════════════════════════════════
     SPOTLIGHT — full-width product feature
     ═══════════════════════════════════════ -->
{#if highlightProduct}
  <section class="page-tiles page-tiles-gap">
    <div class="tile tile-spotlight reveal">
      <a
        href="/products/{highlightProduct.slug}"
        class="tile-bg-link"
        aria-hidden="true"
        tabindex="-1"
      ></a>
      <div class="tile-body tile-body-left">
        <p class="eyebrow">Spotlight</p>
        <h2 class="tile-headline tile-headline-lg">{highlightProduct.name}</h2>
        <p class="tile-subhead">{excerpt(highlightProduct.description, 120)}</p>
        <div class="tile-ctas tile-ctas-left">
          <a href="/products/{highlightProduct.slug}" class="cta-link">Learn more ›</a>
          <a href="/products/{highlightProduct.slug}" class="cta-link cta-link-muted"
            >From {formatPrice(highlightProduct.price)} ›</a
          >
        </div>
      </div>
      <div class="tile-visual tile-visual-spotlight">
        {#if highlightProduct.images?.[0]}
          <img
            src={getImageUrl(highlightProduct, highlightProduct.images[0])}
            alt={highlightProduct.name}
            class="tile-img"
            loading="lazy"
          />
        {:else}
          <div class="tile-img-fallback">{highlightProduct.name.charAt(0)}</div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<!-- ═══════════════════════════════════════
     PROMO BANNER
     ═══════════════════════════════════════ -->
{#if activeBanners.length > 0}
  {@const banner = activeBanners[0]}
  <section class="page-tiles page-tiles-gap">
    <a href={banner.link_url ?? '/products'} class="tile tile-banner reveal">
      <div class="banner-glow" aria-hidden="true"></div>
      <div class="tile-body tile-body-center">
        <h2 class="tile-headline tile-headline-md">{banner.title}</h2>
        {#if banner.subtitle}
          <p class="tile-subhead">{banner.subtitle}</p>
        {/if}
        <div class="tile-ctas">
          <span class="cta-link cta-link-white">Shop now ›</span>
        </div>
      </div>
    </a>
  </section>
{/if}

<!-- ═══════════════════════════════════════
     VALUE PROPOSITIONS
     ═══════════════════════════════════════ -->
<section class="page-tiles page-tiles-gap">
  <div class="values-wrap">
    <div class="cat-header reveal">
      <h2 class="section-heading">Why Shop With Us</h2>
    </div>
    <div class="values-grid">
      <div class="value-card reveal" style="--stagger: 0ms;">
        <div class="value-icon"><SparklesIcon class="icon-md" /></div>
        <h3 class="value-title">Premium Selection</h3>
        <p class="value-desc">Top-tier products hand-picked for quality and performance.</p>
      </div>
      <div class="value-card reveal" style="--stagger: 80ms;">
        <div class="value-icon"><TruckIcon class="icon-md" /></div>
        <h3 class="value-title">Fast Delivery</h3>
        <p class="value-desc">Free 2-day shipping on all orders, straight to your door.</p>
      </div>
      <div class="value-card reveal" style="--stagger: 160ms;">
        <div class="value-icon"><ShieldCheckIcon class="icon-md" /></div>
        <h3 class="value-title">2-Year Warranty</h3>
        <p class="value-desc">Every purchase includes comprehensive coverage for peace of mind.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════
     CTA BLOCK
     ═══════════════════════════════════════ -->
<section class="page-tiles page-tiles-gap page-tiles-bottom">
  <div class="tile tile-cta-block reveal">
    <div class="tile-body tile-body-center">
      <h2 class="tile-headline tile-headline-md">Ready to upgrade?</h2>
      <p class="tile-subhead">Discover the full collection of premium devices.</p>
      <div class="tile-ctas">
        <a href="/products" class="cta-pill">Explore all products</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* ══════════════════════════════════════════
     PAGE SCAFFOLD
     ══════════════════════════════════════════ */
  .page-tiles {
    padding-inline: 12px;
  }
  .page-tiles-gap {
    margin-top: 12px;
  }
  .page-tiles-bottom {
    margin-bottom: 48px;
  }

  /* ══════════════════════════════════════════
     BASE TILE — Apple.com tile pattern
     ══════════════════════════════════════════ */
  .tile {
    position: relative;
    background: #ffffff;
    border-radius: 17px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Invisible full-tile link overlay — sits beneath all interactive content */
  .tile-bg-link {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  /* ─── Text area ─── */
  .tile-body {
    padding: 48px 24px 20px;
    text-align: center;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 660px;
  }

  .tile-body-left {
    text-align: left;
    max-width: none;
    padding: 52px 40px 24px;
  }

  .tile-body-center {
    text-align: center;
    padding-top: 52px;
  }

  .eyebrow {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6e6e73;
    margin-bottom: 8px;
  }

  .tile-headline {
    font-weight: 700;
    color: #1d1d1f;
    line-height: 1.05;
    letter-spacing: -0.025em;
  }

  .tile-headline-hero {
    font-size: clamp(40px, 7vw, 88px);
  }

  .tile-headline-lg {
    font-size: clamp(32px, 5vw, 64px);
  }

  .tile-headline-md {
    font-size: clamp(24px, 3.5vw, 48px);
  }

  .tile-subhead {
    margin-top: 8px;
    font-size: 17px;
    color: #6e6e73;
    line-height: 1.42;
  }

  /* ─── CTA links (Apple text-link style) ─── */
  .tile-ctas {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .tile-ctas-left {
    justify-content: flex-start;
  }

  .cta-link {
    font-size: 17px;
    color: #0071e3;
    text-decoration: none;
    position: relative;
    z-index: 2;
    transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
  }

  .cta-link:hover {
    color: #0077ed;
    text-decoration: underline;
  }

  .cta-link-muted {
    color: #6e6e73;
  }

  .cta-link-muted:hover {
    color: #1d1d1f;
    text-decoration: underline;
  }

  .cta-link-white {
    color: #ffffff;
  }

  .cta-link-white:hover {
    color: #ffffff;
    text-decoration: underline;
  }

  /* ─── Image area ─── */
  .tile-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0 32px 40px;
    position: relative;
    z-index: 1;
  }

  .tile-img {
    max-width: 100%;
    object-fit: contain;
    display: block;
    border-radius: 8px;
  }

  .tile-img-fallback {
    width: 120px;
    height: 120px;
    border-radius: 17px;
    background: #e8e8ed;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: 700;
    color: #aeaeb2;
  }

  /* ══════════════════════════════════════════
     HERO TILE — full-width, above the fold
     ══════════════════════════════════════════ */
  .tile-hero {
    background: #ffffff;
    min-height: 80vh;
    max-height: 900px;
  }

  .tile-hero .tile-body {
    padding-top: 64px;
  }

  .tile-hero .tile-visual {
    flex: 1;
    padding: 0 40px 48px;
    max-height: 460px;
  }

  .tile-hero .tile-img {
    max-height: 400px;
    width: auto;
  }

  /* ══════════════════════════════════════════
     PROMO GRID — 2-column product tiles
     ══════════════════════════════════════════ */
  .promo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .promo-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .tile-promo {
    min-height: 480px;
  }

  .tile-visual-promo {
    flex: 1;
    max-height: 260px;
  }

  .tile-visual-promo .tile-img {
    max-height: 220px;
    width: auto;
  }

  /* ══════════════════════════════════════════
     CATEGORIES
     ══════════════════════════════════════════ */
  .cat-section {
    padding: 48px 0 40px;
  }

  .cat-header {
    text-align: center;
    margin-bottom: 28px;
  }

  .section-heading {
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.02em;
  }

  .cat-row {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cat-row::-webkit-scrollbar {
    display: none;
  }

  .cat-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 28px;
    background: #ffffff;
    border-radius: 17px;
    text-decoration: none;
    scroll-snap-align: start;
    flex-shrink: 0;
    transition: background 0.24s cubic-bezier(0.4, 0, 0.6, 1);
  }

  .cat-tile:hover {
    background: #f5f5f7;
  }

  .cat-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1d1d1f;
  }

  :global(.icon-md) {
    width: 28px;
    height: 28px;
  }

  .cat-name {
    font-size: 13px;
    font-weight: 500;
    color: #1d1d1f;
    white-space: nowrap;
  }

  /* ══════════════════════════════════════════
     SPOTLIGHT — split layout on desktop
     ══════════════════════════════════════════ */
  .tile-spotlight {
    background: #ffffff;
    min-height: 400px;
  }

  .tile-visual-spotlight {
    padding: 0 32px 48px;
    max-height: 340px;
  }

  .tile-visual-spotlight .tile-img {
    max-height: 300px;
    width: auto;
  }

  @media (min-width: 768px) {
    .tile-spotlight {
      flex-direction: row;
      min-height: 500px;
      align-items: stretch;
    }

    .tile-spotlight .tile-body-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 64px 32px 64px 60px;
      max-width: none;
    }

    .tile-visual-spotlight {
      flex: 1;
      max-height: none;
      padding: 40px 60px 40px 20px;
      justify-content: flex-end;
    }

    .tile-visual-spotlight .tile-img {
      max-height: 420px;
    }
  }

  /* ══════════════════════════════════════════
     PROMO BANNER
     ══════════════════════════════════════════ */
  .tile-banner {
    background: linear-gradient(135deg, #e3f0ff 0%, #f0f6ff 50%, #f5f5f7 100%);
    min-height: 240px;
    justify-content: center;
    text-decoration: none;
    padding: 52px 24px;
    cursor: pointer;
  }

  .tile-banner .tile-body {
    padding: 0;
  }

  .tile-banner .tile-headline {
    color: #1d1d1f;
  }

  .banner-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 25% 50%, rgba(0, 113, 227, 0.1), transparent 65%);
    pointer-events: none;
  }

  /* ══════════════════════════════════════════
     VALUE PROPS
     ══════════════════════════════════════════ */
  .values-wrap {
    padding: 48px 0;
  }

  .values-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .values-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .value-card {
    background: #ffffff;
    border-radius: 17px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .value-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0071e3;
  }

  .value-title {
    font-size: 17px;
    font-weight: 600;
    color: #1d1d1f;
    line-height: 1.3;
  }

  .value-desc {
    font-size: 15px;
    color: #6e6e73;
    line-height: 1.5;
  }

  /* ══════════════════════════════════════════
     CTA BLOCK
     ══════════════════════════════════════════ */
  .tile-cta-block {
    background: #ffffff;
    padding: 64px 24px;
    min-height: 0;
  }

  .tile-cta-block .tile-body {
    padding: 0;
  }

  .cta-pill {
    display: inline-flex;
    align-items: center;
    padding: 12px 28px;
    background: #0071e3;
    color: #ffffff;
    border-radius: 980px;
    font-size: 17px;
    font-weight: 500;
    text-decoration: none;
    position: relative;
    z-index: 2;
    transition: opacity 0.24s cubic-bezier(0.4, 0, 0.6, 1);
  }

  .cta-pill:hover {
    opacity: 0.88;
    color: #ffffff;
    text-decoration: none;
  }
</style>
