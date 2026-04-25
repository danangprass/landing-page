# Phase 1: PocketBase Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 01-pocketbase-integration
**Areas discussed:** SDK Client & Auth, Data Fetching Pattern, Realtime & Subscriptions, Type Generation

---

## SDK Client & Auth

| Option | Description | Selected |
|--------|-------------|----------|
| Svelte store wrapper | Single pb.ts + reactive stores around PB instance. Components subscribe to stores. | ✓ |
| Dedicated auth service class | Class-based service with methods for each auth operation. More structured but heavier. | |
| Direct SDK + manual reactive bindings | Use pb.authStore directly, build helpers. Lightest but non-reactive by default. | |

**User's choice:** Svelte store wrapper — matches existing store pattern, keeps things idiomatic for Svelte 5.

| Option | Description | Selected |
|--------|-------------|----------|
| Default localStorage | PB SDK persists auth tokens in localStorage. Works out of the box. | |
| Cookie-based persistence | Use cookies for auth tokens. More secure against XSS. | ✓ |

**User's choice:** Cookie-based persistence — security preference over convenience.

| Option | Description | Selected |
|--------|-------------|----------|
| Layout-level guard | SvelteKit layout group that checks auth and redirects. Clean and standard. | ✓ |
| Per-page guards | Each protected route checks auth individually. More granular but more boilerplate. | |
| You decide | Let Claude decide route guard approach. | |

**User's choice:** Layout-level guard — standard SvelteKit pattern, less boilerplate.

---

## Data Fetching Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Store-wrapped SDK calls | Svelte stores wrap PB SDK calls. Components subscribe to stores. Matches existing pattern. | ✓ |
| Service layer between stores and SDK | services/ directory with pb-products.ts etc. Stores import from services. More separation. | |
| Direct SDK calls in components | Components call pb.collection() directly. Simplest but scatters PB code. | |

**User's choice:** Store-wrapped SDK calls — consistent with existing stores, single source of truth.

| Option | Description | Selected |
|--------|-------------|----------|
| Always paginate | getList() everywhere, never getFullList(). Safe but overkill for small collections. | |
| Smart: paginate large, full-list small | Small collections (categories, banners) use getFullList(). Large ones always paginate. | ✓ |

**User's choice:** Smart pagination — pragmatic balance. Categories, banners, testimonials are tiny.

| Option | Description | Selected |
|--------|-------------|----------|
| Centralized with Toast | Standard error handler that catches PB errors → user messages → Toast component. | ✓ |
| Per-store error handling | Each store handles its own errors. More control but more boilerplate. | |
| You decide | Let Claude decide error handling. | |

**User's choice:** Centralized error handling with Toast — uses existing Toast component, consistent UX.

---

## Realtime & Subscriptions

| Option | Description | Selected |
|--------|-------------|----------|
| Active subscriptions now | Subscribe to cart, wishlist, orders for live updates. Most interactive UX. | ✓ |
| Prep for realtime, add later | Structure code for future subscriptions but don't connect yet. Simpler Phase 1. | |
| No realtime — refresh only | Users refresh to see updates. Simplest but least responsive. | |

**User's choice:** Active subscriptions — cart, wishlist, and order status update in real time.

---

## Type Generation

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generated from schema | Use pocketbase-typegen CLI to generate types from live DB. Always in sync. | ✓ |
| Hand-written TypeScript interfaces | Manually define in types.ts. Full control but can drift. | |

**User's choice:** Auto-generated — stays in sync with schema, less maintenance burden.

---

## Claude's Discretion

- Exact cookie adapter implementation details
- Store internal structure and state shape
- Loading state patterns (skeletons vs spinners)
- Subscription reconnect strategy
- Error message copy and mapping