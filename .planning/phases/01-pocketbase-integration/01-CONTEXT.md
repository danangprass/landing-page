# Phase 1: PocketBase Integration - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate PocketBase JavaScript SDK with the SvelteKit frontend for data access and authentication. Covers: SDK client setup, auth flows (login/register/logout), data fetching patterns, pagination strategy, realtime subscriptions, and TypeScript type generation. UI components already exist — this phase wires them to PocketBase.

</domain>

<decisions>
## Implementation Decisions

### SDK Client & Auth
- **D-01:** Svelte store wrapper pattern — create `src/lib/pb.ts` that exports a PocketBase instance, then build reactive Svelte stores around it. Components subscribe to stores, never call PB directly.
- **D-02:** Cookie-based auth token persistence — implement a custom `AuthStore` adapter that stores tokens in cookies instead of localStorage. More secure against XSS attacks.
- **D-03:** Layout-level route guards — use a SvelteKit layout group (`(auth)/+layout.ts`) that checks `pb.authStore.isValid` and redirects unauthenticated users to login. Protected routes: cart, wishlist, orders, profile.

### Data Fetching Pattern
- **D-04:** Store-wrapped SDK calls — existing Svelte stores (`products.ts`, `cart.svelte.ts`, `wishlist.svelte.ts`) wrap PB SDK calls. Components import stores, stores handle all PB communication.
- **D-05:** Smart pagination — small collections (categories, banners, testimonials) use `getFullList()` since they're under 100 records. Large collections (products, orders, reviews) always use `getList(page, perPage)` with server-side filters. Default 20 items per page.
- **D-06:** Centralized error handling with Toast — create `src/lib/pb-error-handler.ts` that catches PB errors, maps status codes to user messages, and shows notifications via the existing Toast component.

### Realtime & Subscriptions
- **D-07:** Active realtime subscriptions from day one — subscribe to cart_items, wishlists, and orders collections. UI updates live when items are added/removed or order status changes. Clean subscribe/unsubscribe in store lifecycle.

### Type Generation
- **D-08:** Auto-generated TypeScript types from PocketBase schema — use `pocketbase-typegen` CLI to generate `src/lib/pb-types.ts` from the live database. Add as a `pb:types` npm script. Commit the generated output.

### Claude's Discretion
- Exact cookie adapter implementation details
- Store internal structure and state shape
- Loading state patterns (skeletons vs spinners)
- Subscription reconnect strategy
- Error message copy and mapping

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PocketBase SDK
- `.planning/REQUIREMENTS.md` — REQ-01 through REQ-10, NFR-01 through NFR-03

### Existing Code
- `src/lib/stores/products.ts` — Existing product store (to be refactored to use PB)
- `src/lib/stores/cart.svelte.ts` — Existing cart store (to be refactored to use PB)
- `src/lib/stores/wishlist.svelte.ts` — Existing wishlist store (to be refactored to use PB)
- `src/lib/components/` — All existing UI components that will consume PB data
- `src/routes/` — Existing route structure

### Infrastructure
- `Dockerfile` — PocketBase Docker setup
- `docker-compose.yml` — PB runs on localhost:8090 with pb_data volume
- `scripts/seed.py` — Database seeding script (reference for schema)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/components/ProductCard.svelte` — Displays products, will consume PB product data
- `src/lib/components/PriceDisplay.svelte` — Handles price/compare_at_price rendering
- `src/lib/components/RatingStars.svelte` — Rating display, will work with PB review data
- `src/lib/components/Toast.svelte` — Notification component for error/success feedback
- `src/lib/components/Navbar.svelte` — Navigation with cart badge, will need auth state
- `src/lib/components/FilterSidebar.svelte` — Category filtering, will filter PB products
- `src/lib/components/QuantityStepper.svelte` — Quantity control for cart

### Established Patterns
- Svelte 5 runes (.svelte.ts stores with `$state`, `$derived`)
- Tailwind CSS for styling
- SvelteKit file-based routing

### Integration Points
- `src/lib/stores/` — Replace mock data with PB SDK calls
- `src/routes/+layout.svelte` — Add auth provider/context
- `src/routes/` — Add `(auth)/` layout group for protected routes

</code_context>

<specifics>
## Specific Ideas

- PocketBase SDK's `authWithPassword()` for login, `create()` for register
- `pb.authStore.onChange` for reactive auth state in Svelte
- Use `expand` parameter on relations to avoid N+1 queries (e.g., products with category, reviews with user)
- Cookie auth adapter needs to work with SvelteKit's server-side load functions for SSR

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-pocketbase-integration*
*Context gathered: 2026-04-23*