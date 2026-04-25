# Bug Report — PocketBase Data Not Showing in Frontend

**Date:** 2026-04-24
**Status:** Fixed

---

## Summary

PocketBase data was not rendering in the frontend app across all pages (landing, products list, product detail). Three separate root causes were identified.

---

## Root Cause 1: Invalid `sort` Field → HTTP 400

**Severity:** Critical — blocked all PocketBase data from loading

### Finding

Every product query sent `sort=-created` to PocketBase, but the `products` collection has no `created` auto-date field. This caused a **400 Bad Request** on every request.

```
GET /api/collections/products/records?sort=-created&...
→ 400 Bad Request: "Something went wrong while processing your request."
```

Because `safeCall` uses `{ silent: true }` throughout the store, the error was swallowed silently. The store fell back to static data (or empty arrays), and no PocketBase data ever reached the UI.

### Fix

**File:** `src/lib/stores/products.svelte.ts`

Changed `sort: '-created'` → `sort: '-name'` in two places:

- `loadProducts()` — the main paginated product list query
- `loadFeatured()` — the featured products query

---

## Root Cause 2: IntersectionObserver Set Up Before Data Loads → Elements Invisible

**Severity:** High — data loaded but was invisible

### Finding

The `.reveal` CSS class starts all elements at `opacity: 0`. An `IntersectionObserver` is responsible for adding `.visible` to make them appear. However, the observer `$effect` had **no reactive dependencies**, so it ran exactly once on mount — before any PocketBase data arrived.

```
Mount → $effect runs → querySelectorAll('.reveal') → finds 0 elements
...async PB fetch completes...
New .reveal elements added to DOM → observer never re-runs → stays at opacity: 0
```

All PocketBase-driven content (featured products, categories, product cards) was technically in the DOM but invisible.

Additionally, the hero section on the landing page uses a separate `.clip-reveal.hidden` pattern:
```css
.clip-reveal.hidden { clip-path: inset(0 100% 0 0); }  /* fully clipped */
```
There was no JavaScript to remove the `hidden` class, so hero text (title, subtitle, badge, price) was permanently invisible even when `heroProduct` existed.

### Fix

**File:** `src/routes/+page.svelte`

Made the reveal `$effect` depend on `store.products` and `store.categories`, so it re-runs after data loads. Also added logic to remove `hidden` from `.clip-reveal` elements with a staggered delay.

```js
$effect(() => {
  store.products;     // reactive dependency
  store.categories;   // reactive dependency

  // Unhide hero clip-reveal elements
  const timeouts = [];
  document.querySelectorAll('.clip-reveal.hidden').forEach((el, i) => {
    const id = setTimeout(() => el.classList.remove('hidden'), i * 150 + 100);
    timeouts.push(id);
  });

  // Observe only elements not yet visible
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver(...);
  for (const el of els) observer.observe(el);
  return () => { timeouts.forEach(clearTimeout); observer.disconnect(); };
});
```

**File:** `src/routes/products/+page.svelte`

Made the observer `$effect` depend on `filteredProducts`:

```js
$effect(() => {
  filteredProducts;  // reactive dependency — re-run when products load
  const observer = new IntersectionObserver(...);
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
  return () => observer.disconnect();
});
```

**File:** `src/routes/products/[slug]/+page.svelte`

Added a missing observer `$effect` entirely (the detail page had `.reveal` elements but no observer at all):

```js
$effect(() => {
  product;  // reactive dependency
  const observer = new IntersectionObserver(...);
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
  return () => observer.disconnect();
});
```

---

## Root Cause 3: `loadCategories` Called Inside Reactive Product Effect → Double Render

**Severity:** Medium — categories flickered / appeared to render twice in sidebar

### Finding

`store.loadCategories()` was placed inside the same `$effect` as `store.loadProducts()`. Because that effect has a dependency on `selectedCategory`, every time the user clicked a category filter, categories were re-fetched and the `categories` array was replaced — causing a visible flicker (the category pills disappeared and reappeared).

```js
// BEFORE — runs on every category click
$effect(() => {
  store.loadProducts({ category: selectedCategory || undefined });
  store.loadCategories();  // re-fetched unnecessarily
});
```

### Fix

**File:** `src/routes/products/+page.svelte`

Separated `loadCategories` into its own `$effect` with no reactive dependencies, so it runs once on mount only:

```js
$effect(() => {
  store.loadCategories();  // runs once on mount
});

$effect(() => {
  store.loadProducts({ category: selectedCategory || undefined });  // re-runs on filter change
});
```

Also added this call to `products/+page.svelte` specifically because the categories store was only populated from the landing page — navigating directly to `/products` showed no category filter pills.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/stores/products.svelte.ts` | `sort: '-created'` → `sort: '-name'` in `loadProducts` and `loadFeatured` |
| `src/routes/+page.svelte` | Observer `$effect` now depends on `store.products` + `store.categories`; added clip-reveal unhiding logic |
| `src/routes/products/+page.svelte` | Observer `$effect` depends on `filteredProducts`; separated `loadCategories` into own effect; added `loadCategories` call |
| `src/routes/products/[slug]/+page.svelte` | Added missing observer `$effect` keyed on `product` |

---

## Key Lesson

All `safeCall` invocations use `{ silent: true }`, which means API errors only appear in the browser console — the UI silently falls back to static data or empty state. When debugging missing data, always check the browser Network tab first before assuming a frontend rendering issue.
