# UI-SPEC.md — Electronics Online Store (Apple.com-inspired)

**Phase**: 1 — Full storefront UI
**Stack**: SvelteKit + Tailwind CSS + Vite
**Reference Images**: `/references/` (4 JPG mobile UI references)
**Style Inspiration**: apple.com — minimalist, large hero imagery, generous whitespace, clean typography

---

## 1. Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#000000` | Page background |
| `--color-surface` | `#1d1d1f` | Cards, nav, secondary bg |
| `--color-surface-hover` | `#2d2d2f` | Hover states |
| `--color-text-primary` | `#f5f5f7` | Headings, body text |
| `--color-text-secondary` | `#86868b` | Captions, metadata |
| `--color-accent` | `#2997ff` | CTAs, links, active states |
| `--color-accent-hover` | `#0a84ff` | Hover for accent |
| `--color-success` | `#30d158` | Stock available, confirmations |
| `--color-warning` | `#ff9f0a` | Low stock, alerts |
| `--color-error` | `#ff453a` | Out of stock, errors |
| `--color-border` | `#424245` | Dividers, card borders |

### Typography
| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Display | Inter / SF Pro | 700 | 56px / 3.5rem | 1.07 |
| H1 | Inter / SF Pro | 600 | 48px / 3rem | 1.08 |
| H2 | Inter / SF Pro | 600 | 40px / 2.5rem | 1.1 |
| H3 | Inter / SF Pro | 600 | 28px / 1.75rem | 1.14 |
| Body | Inter / SF Pro | 400 | 17px / 1.0625rem | 1.47 |
| Caption | Inter / SF Pro | 400 | 14px / 0.875rem | 1.43 |
| Price | Inter / SF Pro | 600 | 24px / 1.5rem | 1.17 |

### Spacing Scale
4px base unit: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Badges, small buttons |
| `--radius-md` | 12px | Cards, inputs |
| `--radius-lg` | 18px | Hero cards, modals |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows
| Token | Value |
|-------|-------|
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.4)` |
| `--shadow-elevated` | `0 8px 32px rgba(0,0,0,0.6)` |

---

## 2. Page Contracts

### 2.1 Landing Page (`/`)
**Layout**: Full-width sections, each section fills viewport or near-viewport height.

| Section | Content | Height | Notes |
|---------|---------|--------|-------|
| **Nav** | Logo, category links (hidden on mobile → hamburger), search icon, cart icon with badge | 48px sticky | Translucent blur on scroll |
| **Hero** | Large product image (e.g., flagship device), headline, subtext, 2 CTAs (Learn more / Buy) | 100vh | Center-aligned, text over image |
| **Product Grid** | 2–3 featured products, each in a card with image + name + price + link | ~500px | Responsive grid, dark surface bg |
| **Feature Highlight** | Single product, full-width image, 3–4 key specs, link to detail | 80vh | Alternating left/right text |
| **Category Row** | Horizontal scroll of category tiles (Phones, Laptops, Audio, Wearables, Accessories) | ~300px | Snap scrolling on mobile |
| **Promo Banner** | Seasonal/timed offer with countdown | ~200px | Accent background |
| **Footer** | 5-column links, copyright, legal | auto | Collapsible on mobile |

**Scroll behavior**: Sections reveal with `translateY(20px)` fade-in on viewport entry.
**Nav behavior**: Sticky with `backdrop-filter: blur(20px)` + `background: rgba(0,0,0,0.8)` after 100px scroll.

### 2.2 Products List (`/products`)
**Layout**: Filter sidebar (desktop) / filter drawer (mobile) + product grid.

| Element | Specs |
|---------|-------|
| **Breadcrumb** | Home > Products > {Category} |
| **Filter sidebar** | 280px fixed, categories, price range slider, brand checkboxes, rating filter |
| **Mobile filter** | Bottom sheet, "Filter & Sort" button in sticky header |
| **Sort dropdown** | Featured, Price Low→High, Price High→Low, Newest, Rating |
| **Product card** | Image (aspect 1:1), name, category tag, price, "Add to Bag" button, wishlist icon |
| **Grid** | 4 cols desktop, 2 cols tablet, 2 cols mobile |
| **Pagination** | Infinite scroll with "Load more" button |
| **Empty state** | "No products found" + clear filters link |

### 2.3 Product Detail (`/products/[slug]`)
**Layout**: Two-column (image | details) on desktop, stacked on mobile.

| Section | Specs |
|---------|-------|
| **Breadcrumb** | Home > Products > {Category} > {Product} |
| **Image gallery** | Main image + 4–6 thumbnails below; click to swap main; pinch-zoom on mobile |
| **Product info** | Category tag, product name, price, rating stars + count, short description |
| **Color picker** | Swatches with label, border on selected |
| **Storage/variant picker** | Pill buttons, selected = accent bg |
| **Add to Bag** | Full-width button, disabled state for out-of-stock |
| **Wishlist** | Heart icon toggle |
| **Delivery info** | Estimated date, free shipping badge |
| **Specs table** | Key specs in 2-col table, "See full specs" expandable |
| **Related products** | Horizontal scroll, 4–6 items |
| **Reviews** | Star distribution bar, top 3 reviews, "See all reviews" link |

### 2.4 Cart (`/cart`)
**Layout**: Cart items (left 60%) + Order summary (right 40%), stacked on mobile.

| Element | Specs |
|---------|-------|
| **Cart item** | Image thumbnail, name, variant (color/storage), quantity stepper (−/1/+), unit price, remove (×) |
| **Empty cart** | Bag icon, "Your bag is empty", link to products |
| **Order summary** | Subtotal, shipping estimate, tax estimate, divider, **Total**, "Checkout" CTA button |
| **Promo code** | Collapsible input + apply button |
| **Continue shopping** | Text link below summary |

**Quantity stepper**: Min 1, max stock. Zero → auto-remove with undo toast (5s).

### 2.5 Checkout (`/checkout`)
**Layout**: Stepper header (Shipping → Payment → Review) + form sections.

| Step | Fields | Validation |
|------|--------|------------|
| **Shipping** | Full name, address line 1+2, city, state/province, zip, country, phone | All required, zip format by country |
| **Shipping method** | Radio: Standard (free, 5–7d), Express ($9.99, 2–3d), Overnight ($19.99, 1d) | Required |
| **Payment** | Card number, expiry, CVV (or Apple Pay / Google Pay buttons) | Luhn check, future expiry, 3–4 digit CVV |
| **Review** | Order summary read-only, edit links per section, "Place Order" CTA | Confirmation checkbox |

**Stepper**: Active step = accent color, completed = checkmark, upcoming = muted.
**Mobile**: Single column, each step full page with "Continue" bottom bar.

---

## 3. Shared Components

| Component | Props | Notes |
|-----------|-------|-------|
| `<Navbar>` | cartCount | Sticky, blur, responsive hamburger |
| `<Footer>` | — | 5-column, collapsible mobile |
| `<ProductCard>` | product, wishlistCallback | Hover: lift shadow, image scale 1.03 |
| `<PriceDisplay>` | price, originalPrice?, discount? | Strikethrough for original, accent for discount |
| `<Badge>` | label, variant (new/sale/limited) | Positioned top-left on card |
| `<QuantityStepper>` | value, min, max, onChange | Compact, centered number |
| `<RatingStars>` | rating, count | Filled/half/empty stars |
| `<FilterSidebar>` | filters, activeFilters, onChange | Desktop: sticky sidebar; mobile: bottom sheet |
| `<Toast>` | message, type, duration | Bottom-center, auto-dismiss 3s |

---

## 4. Responsive Breakpoints

| Breakpoint | Width | Columns | Nav | Filter |
|------------|-------|---------|-----|--------|
| Mobile | <640px | 2 | Hamburger | Bottom sheet |
| Tablet | 640–1024px | 2–3 | Compact | Collapsible |
| Desktop | >1024px | 4 | Full | Sidebar visible |

---

## 5. Motion & Transitions

| Context | Property | Duration | Easing |
|---------|----------|----------|--------|
| Page entry | `opacity` + `translateY(20px)` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Card hover | `box-shadow` + `transform: scale(1.03)` | 300ms | `ease-out` |
| Modal open | `opacity` + `translateY(0)` | 300ms | `spring(1, 80, 10)` |
| Toast | `translateY(100%) → 0` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Route transition | `opacity: 0 → 1` | 200ms | `ease-in-out` |

All transitions respect `prefers-reduced-motion: reduce` → instant.

---

## 6. Accessibility

- All interactive elements reachable via keyboard (Tab order logical)
- Focus visible: 2px accent outline offset 2px
- Color contrast: minimum 4.5:1 (WCAG AA) for text, 3:1 for large text
- Images: meaningful `alt` text for product images, empty `alt` for decorative
- ARIA: `aria-label` on icon buttons, `aria-live="polite"` for cart count, toast announcements
- Skip-to-content link on every page

---

## 7. Dark Mode Only

This design is **dark-mode only** (matching apple.com's dark aesthetic). No light theme toggle. Background is always `#000`, text is always `#f5f5f7`.

---

## 8. Reference Images

Four reference images in `/references/` directory:
- `cc8a6eba02d9cddb60489c692179846b.jpg` — Full-page mobile layout reference (976×1952)
- `50e6212b21cc10f5dcd2bac620f8ddbd.jpg` — Mobile page reference (736×1308)
- `5d54a940f0e8ef72f6ddcea6fc1cf095.jpg` — Mobile page reference (800×1200)
- `b122c9804ffbdcb4067533261ab70dd5.jpg` — Component/square reference (736×736)

These inform card layout, spacing density, and mobile navigation patterns.

---

## UI-SPEC COMPLETE ✓