# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Electronics online store — Apple.com-inspired dark UI built with SvelteKit + Tailwind CSS.
5 pages: Landing, Products List, Product Detail, Cart, Checkout.

## UI Design Contract

Full design spec at `.planning/01-UI-SPEC.md` — colors, typography, spacing, page layouts, components, motion, and accessibility rules. **Read it before making UI changes.**

Key design decisions:
- Dark-mode only (`#000` bg, `#f5f5f7` text)
- Apple.com aesthetic: generous whitespace, large hero imagery, clean typography
- 4 reference images in `/references/` inform layout patterns

## Stack

- SvelteKit (with Svelte 5 runes)
- Tailwind CSS v4
- Vite
- npm

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint
npm test             # Run tests
```

## Architecture

- `src/routes/` — SvelteKit pages: `+page.svelte`, `+layout.svelte`
- `src/lib/components/` — Shared UI components (Navbar, Footer, ProductCard, etc.)
- `src/lib/data/` — Product data and types
- `src/lib/stores/` — Svelte stores (cart, wishlist)
- `static/` — Images, fonts, favicon

## Conventions

- Use Tailwind utility classes directly — no separate CSS files unless truly needed
- Svelte 5 runes (`$state`, `$derived`, `$effect`) — no legacy `$:` syntax
- Component props: use TypeScript interfaces
- Dark-mode only — no theme toggle needed
- All transitions must respect `prefers-reduced-motion`