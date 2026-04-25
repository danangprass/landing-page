<script lang="ts">
  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { label: 'Phones', href: '/products?category=phones' },
        { label: 'Laptops', href: '/products?category=laptops' },
        { label: 'Audio', href: '/products?category=audio' },
        { label: 'Wearables', href: '/products?category=wearables' },
        { label: 'Accessories', href: '/products?category=accessories' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '#' },
        { label: 'FAQs', href: '#' },
        { label: 'Shipping', href: '#' },
        { label: 'Returns', href: '#' }
      ]
    },
    {
      title: 'About',
      links: [
        { label: 'Our Story', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
        { label: 'Sustainability', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' }
      ]
    }
  ];

  let currentYear = $derived(new Date().getFullYear());
</script>

<footer class="footer">
  <div class="section-padding footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="ElectraStore home">
          Electra<span class="footer-logo-accent">Store</span>
        </a>
        <p class="footer-tagline">
          Premium electronics, delivered with care. Technology that inspires.
        </p>
      </div>

      {#each footerLinks as section, sectionIndex}
        <div class="footer-section" style="--stagger-index: {sectionIndex}">
          <h3 class="footer-heading">{section.title}</h3>
          <ul class="footer-list">
            {#each section.links as link}
              <li>
                <a href={link.href} class="footer-link">
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">
        &copy; {currentYear} ElectraStore. All rights reserved.
      </p>
      <p class="footer-credit">
        Designed with precision. Built for performance.
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: var(--color-surface);
    border-top: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
    margin-top: auto;
  }

  .footer-inner {
    padding-top: 3rem;
    padding-bottom: 1.5rem;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .footer-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .footer-grid {
      grid-template-columns: 1fr repeat(4, 1fr);
    }
  }

  /* Brand column */
  .footer-brand {
    grid-column: 1 / -1;
    margin-bottom: 0.5rem;
  }

  @media (min-width: 1024px) {
    .footer-brand {
      grid-column: auto;
      margin-bottom: 0;
    }
  }

  .footer-logo {
    display: inline-block;
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: -0.025em;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: transform 160ms var(--ease-out);
  }

  .footer-logo:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .footer-logo:hover {
      color: var(--color-text-primary);
      transform: scale(1.03);
    }
  }

  .footer-logo-accent {
    color: var(--color-accent);
  }

  .footer-tagline {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
    max-width: 20rem;
    line-height: 1.5;
  }

  /* Section columns */
  .footer-section {
    opacity: 0;
    transform: translateY(8px);
    animation: footer-reveal 400ms var(--ease-out) forwards;
    animation-delay: calc(var(--stagger-index, 0) * 60ms + 100ms);
  }

  @keyframes footer-reveal {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .footer-heading {
    color: var(--color-text-primary);
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .footer-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-link {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 160ms var(--ease-out);
  }

  .footer-link:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .footer-link:hover {
      color: var(--color-text-primary);
    }
  }

  /* Bottom bar */
  .footer-bottom {
    border-top: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .footer-copy,
  .footer-credit {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    margin: 0;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .footer-section {
      opacity: 1;
      transform: none;
      animation: none;
    }
    .footer-logo,
    .footer-link {
      transition: none;
    }
  }
</style>