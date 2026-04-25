# Requirements — Landing Page E-Commerce

## Functional Requirements

### REQ-01: PocketBase SDK Integration
- Integrate PocketBase JavaScript SDK into Svelte project
- Configure connection to PocketBase instance at localhost:8090
- Set up authentication state management (login, register, logout)
- Handle token refresh and session persistence

### REQ-02: Product Catalog (Read)
- List products with pagination (20 per page)
- Filter products by category
- Search products by name/slug
- Show featured products on landing page
- Expand product detail with category relation
- Display sale prices (compare_at_price vs price)

### REQ-03: Product Detail Page
- Fetch single product by slug or ID
- Display product images gallery
- Show related products from same category
- Display product reviews with user info (expand)
- Check stock availability

### REQ-04: User Authentication
- Register new user account (email + password + name)
- Login with email/password
- Persist auth state across page reloads
- Logout
- Auth-guarded routes (cart, wishlist, orders, profile)

### REQ-05: Shopping Cart
- Add product to cart (auth required)
- Update cart item quantity
- Remove item from cart
- View cart with expanded product details
- Calculate cart total

### REQ-06: Wishlist
- Add product to wishlist (auth required)
- Remove product from wishlist
- View wishlist with expanded product details
- Check if product is in wishlist (for heart icon state)

### REQ-07: Order Management
- Create order from cart items
- View order history (user-scoped)
- View order detail with expanded items and products
- Display order status (pending/processing/shipped/delivered/cancelled)

### REQ-08: Reviews
- Create review for purchased product (auth required)
- View reviews on product page (public)
- Only allow one review per user per product

### REQ-09: Landing Page Data
- Fetch active banners with sort order
- Fetch featured products
- Fetch testimonials (active only, sorted by sort_order)
- Newsletter subscription (public, email unique)

### REQ-10: Performance & Pagination
- Never use getFullList() on large collections
- Always paginate with getList(page, perPage)
- Use expand for relations to avoid N+1
- Filter server-side with PocketBase filter syntax
- Lazy-load product images and list pages

## Non-Functional Requirements

### NFR-01: Type Safety
- Generate or define TypeScript types for all PocketBase collections
- Type-safe SDK client wrapper

### NFR-02: Error Handling
- Handle PocketBase errors (404, 403, network) gracefully
- Show user-friendly error messages
- Retry logic for failed requests

### NFR-03: Realtime (Future)
- Structure code to allow realtime subscriptions later
- Subscribe to cart/wishlist/order changes when authenticated

---

*Created: 2026-04-23*