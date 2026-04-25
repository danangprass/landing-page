# Bug Fix Report — PocketBase Data Integration

**Date:** 2026-04-24  
**Status:** Resolved  
**Affected Areas:** Product Store, Landing Page, Products List, Product Detail, Category Filtering

---

## 1. Problem Statement

PocketBase data was not rendering in the frontend application across all pages. The UI showed empty states or only static fallback data, with `400 Bad Request` errors appearing in the browser console on every PocketBase API call.

---

## 2. Root Cause Analysis

### 2.1 Invalid `sort` Field (Critical)

Every product query sent `sort: '-created'` to PocketBase, but the `products` collection schema lacked a `created` auto-date field. This caused a **400 Bad Request** on every request, triggering the silent fallback path before any data reached the UI.

```
GET /api/collections/products/records?sort=-created&...
→ 400 Bad Request: "Something went wrong while processing your request."
```

### 2.2 Invalid `active` Field Filter (Critical)

The store added `filter: 'active = true'` to all collection queries (`products`, `categories`, `banners`, `testimonials`). When PocketBase collections do not contain an `active` boolean field, this filter also returns **400 Bad Request**, compounding the first issue.

### 2.3 IntersectionObserver Ran Before Data Arrived (High)

`.reveal` CSS starts elements at `opacity: 0`. The `IntersectionObserver` `$effect` had no reactive dependencies on async data, so it ran once on mount and found zero `.reveal` elements. When PocketBase data eventually loaded and new DOM nodes appeared, they remained invisible because the observer never re-ran.

Additionally, `.clip-reveal.hidden` elements in the hero section had no JavaScript logic to remove the `hidden` class, leaving hero text permanently clipped.

### 2.4 `loadCategories` Double-Fired + Duplicate Slugs (Medium)

The landing page and `/products` page both called `store.loadCategories()` inside `$effect`. During SPA navigation this caused two concurrent requests. PocketBase returned duplicate rows, and the store assigned them directly to state without deduplication, resulting in two "Smartphone" pills, two "Audio" pills, etc.

### 2.5 Category Filter Did Not Re-Render Products (Medium)

Clicking a category in `FilterSidebar` updated `selectedCategory` state and pushed a new URL, but the product grid did not reload because `handleCategoryChange` never triggered `store.loadProducts()`.

### 2.6 Active Category Pill Stuck on Previous Value (Medium)

A URL-sync `$effect` read `selectedCategory` while also writing it:

```js
$effect(() => {
  const cat = page.url.searchParams.get('category') ?? '';
  if (cat !== selectedCategory) selectedCategory = cat;
});
```

When the user clicked a new category, `handleCategoryChange` set `selectedCategory = 'audio'`, but the sync effect immediately overwrote it back to the stale URL value `'smartphones'`, so the active pill never visually changed.

---

## 3. Fixes Applied

### 3.1 Safe PocketBase Queries (`src/lib/stores/products.svelte.ts`)

- Removed `filter: 'active = true'` from **all** collection queries (`products`, `categories`, `banners`, `testimonials`).
- Removed `filter: 'featured = true && active = true'` from `loadFeatured`.
- Changed `sort: '-created'` → `sort: '-name'` in `loadProducts()` and `loadFeatured()`.
- Removed the global `active = true` default filter string, building filters only from valid runtime inputs (`categoryId`, `search`).
- If PocketBase is empty or returns an error, every loader falls back to the static `products` array mapped into the `ExpandedProduct` shape.

### 3.2 Reactive IntersectionObserver + Clip-Reveal Unhiding

**`src/routes/+page.svelte`**  
Made the observer `$effect` depend on `store.products` and `store.categories` so it re-runs after async data populates the DOM. Added staggered `setTimeout` logic to remove `.hidden` from `.clip-reveal` hero elements.

**`src/routes/products/+page.svelte`**  
Made the observer `$effect` depend on `filteredProducts`.

**`src/routes/products/[slug]/+page.svelte`**  
Added the missing observer `$effect` keyed on `product`.

### 3.3 Category Deduplication + In-Flight Guard (`src/lib/stores/products.svelte.ts`)

- Added a `categoriesLoading` boolean flag so `loadCategories()` is a no-op if a request is already in-flight.
- Added `dedupeBySlug()` helper that filters the categories array by unique `slug` before writing to state.

```ts
function dedupeBySlug(arr: CategoriesRecord[]): CategoriesRecord[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}
```

### 3.4 Immediate Product Reload on Category Click (`src/routes/products/+page.svelte`)

Added `store.loadProducts({ category: cat || undefined })` directly inside `handleCategoryChange`. The existing reactive `$effect` on `selectedCategory` remains as a safety net.

### 3.5 Fixed Stuck Active State (`src/routes/products/+page.svelte`)

Wrapped the reactive read inside `untrack()` so the sync effect only reacts to URL changes (e.g. back button), not local state mutations:

```ts
import { untrack } from 'svelte';

$effect(() => {
  const cat = page.url.searchParams.get('category') ?? '';
  if (cat !== untrack(() => selectedCategory)) {
    selectedCategory = cat;
  }
});
```

---

## 4. Files Changed

| File | Change |
|------|--------|
| `src/lib/stores/products.svelte.ts` | Removed invalid `active`/`created` filters; added `categoriesLoading` guard; added `dedupeBySlug()`; changed sort to `-name`; added static fallback mapping |
| `src/routes/+page.svelte` | Observer `$effect` depends on `store.products` + `store.categories`; added clip-reveal unhiding logic |
| `src/routes/products/+page.svelte` | Observer depends on `filteredProducts`; separated `loadCategories` into own effect; added immediate `loadProducts` call in `handleCategoryChange`; added `untrack` import and fixed active-state sync effect |
| `src/routes/products/[slug]/+page.svelte` | Added missing observer `$effect` keyed on `product` |

---

## 5. Verification Steps

1. **Landing page** — hero text appears with staggered animation; featured products, categories, and testimonials render.
2. **Products list** — all products load; clicking a category filter updates both the product grid and the active pill highlight.
3. **Category pills** — only one pill per category slug; no duplicates after SPA navigation.
4. **Product detail** — direct navigation to `/products/{slug}` renders correctly with reveal animations.
5. **PocketBase offline** — if PB returns 400 or is unreachable, static fallback products and categories render immediately.

---

## 6. Key Lessons

- **Schema mismatch causes silent failures.** When `safeCall` uses `{ silent: true }`, API errors only appear in the browser console. Always verify the Network tab first.
- **`$effect` without reactive dependencies runs once.** Any DOM-measuring logic (`querySelectorAll`, `IntersectionObserver`) must declare dependencies on the async data that populates the DOM.
- **Reactive sync effects create race conditions.** Reading and writing the same state variable inside `$effect` causes circular overwrites; use `untrack()` for the read side.
