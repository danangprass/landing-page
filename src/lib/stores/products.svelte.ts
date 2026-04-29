import { getContext, setContext } from 'svelte';
import { pb } from '$lib/pb';
import { safeCall } from '$lib/pb-error-handler.svelte';
import type { CategoriesRecord, BannersRecord, TestimonialsRecord } from '$lib/pb-types';
import type { ExpandedProduct } from '$lib/pb-types-ext';
import { products as staticProducts } from '$lib/data/products';
import type { Product } from '$lib/data/products';

function mapStaticProduct(p: Product): ExpandedProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compare_at_price: p.originalPrice,
    description: p.description,
    images: p.images as unknown as ExpandedProduct['images'],
    featured: p.badge === 'new',
    stock: p.inStock ? 99 : 0,
    active: true,
    sku: p.slug,
    expand: {
      category: {
        id: 'static-' + p.categorySlug,
        name: p.category,
        slug: p.categorySlug,
        active: true,
      } as unknown as CategoriesRecord,
    },
  } as ExpandedProduct;
}

const staticMapped = staticProducts.map(mapStaticProduct);

function deriveStaticCategories(): CategoriesRecord[] {
  const map = new Map<string, CategoriesRecord>();
  for (const p of staticMapped) {
    const cat = p.expand?.category;
    if (cat && !map.has(cat.slug)) {
      map.set(cat.slug, { ...cat } as unknown as CategoriesRecord);
    }
  }
  return Array.from(map.values());
}

function filterStatic(opts?: { category?: string; search?: string; featured?: boolean; page?: number }) {
  let items = [...staticMapped];
  if (opts?.category) {
    const c = opts.category;
    items = items.filter(p => p.expand?.category?.slug === c || p.expand?.category?.name === c);
  }
  if (opts?.search) {
    const s = opts.search.toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s) ||
      (p.description ?? '').toLowerCase().includes(s)
    );
  }
  if (opts?.featured) {
    items = items.filter(p => p.featured);
  }
  const currentPage = opts?.page ?? 1;
  const perPage = 20;
  const totalItems = items.length;
  const start = (currentPage - 1) * perPage;
  const paginated = items.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  return { items: paginated, totalItems, totalPages, page: Math.min(currentPage, totalPages) };
}

function createProductsStore() {
  let products = $state<ExpandedProduct[]>([]);
  let categories = $state<CategoriesRecord[]>([]);
  let banners = $state<BannersRecord[]>([]);
  let testimonials = $state<TestimonialsRecord[]>([]);
  let loading = $state(false);
  let page = $state(1);
  let totalPages = $state(1);
  const perPage = 20;

  let categoriesLoading = false;

  async function loadCategories() {
    if (categoriesLoading) return;
    categoriesLoading = true;
    const [result] = await safeCall(() =>
      pb.collection('categories').getFullList({
        sort: 'sort_order',
      }),
      { silent: true }
    );
    categoriesLoading = false;
    if (result && result.length > 0) {
      const deduped = dedupeBySlug(result as unknown as CategoriesRecord[]);
      categories = deduped.length ? deduped : deriveStaticCategories();
    } else {
      categories = deriveStaticCategories();
    }
  }

  function dedupeBySlug(arr: CategoriesRecord[]): CategoriesRecord[] {
    const seen = new Set<string>();
    return arr.filter(item => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }

  function safe(s: string): string {
    // Escape regex metacharacters first, then quotes to avoid double-escaping
    // * ? [ ] ( ) { } ^ $ . | \ + have special meaning in regex-like patterns
    s = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(/"/g, '\\"');
    return s;
  }

  const SORT_MAP: Record<string, string> = {
    'featured': '-name',
    'price-asc': 'price',
    'price-desc': '-price',
    'newest': '-created',
    'rating': '-rating',
  };

  async function loadProducts(opts?: {
    page?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    loading = true;
    const currentPage = opts?.page ?? 1;

    let categoryId: string | null = null;
    if (opts?.category) {
      const [catResult] = await safeCall(() =>
        pb.collection('categories').getFirstListItem(`slug = "${safe(opts.category!)}"`),
        { silent: true }
      );
      if (catResult) {
        categoryId = (catResult as unknown as CategoriesRecord).id;
      }
    }

    const filters: string[] = [];
    if (categoryId) {
      filters.push(`category = "${safe(categoryId)}"`);
    }
    if (opts?.search) {
      const s = safe(opts.search);
      filters.push(`name ~ "${s}" || slug ~ "${s}" || (description != null && description ~ "${s}")`);
    }
    if (opts?.minPrice !== undefined && opts.minPrice > 0) {
      filters.push(`price >= ${opts.minPrice}`);
    }
    if (opts?.maxPrice !== undefined && opts.maxPrice < 2000) {
      filters.push(`price <= ${opts.maxPrice}`);
    }
    const filter = filters.length ? filters.join(' && ') : undefined;

    const [result] = await safeCall(() =>
      pb.collection('products').getList(currentPage, perPage, {
        expand: 'category',
        sort: SORT_MAP[opts?.sort ?? 'featured'] ?? '-name',
        ...(filter ? { filter } : {}),
      }),
      { silent: true }
    );
    loading = false;

    if (result && result.items.length > 0) {
      let items = result.items as unknown as ExpandedProduct[];
      if (opts?.featured) {
        items = items.filter(p => p.featured);
      }
      // Apply category filter locally if PocketBase lookup failed silently
      if (opts?.category && !categoryId) {
        items = items.filter((p: ExpandedProduct) =>
          p.expand?.category?.slug === opts!.category
        );
      }
      products = items;
      totalPages = result.totalPages;
      page = result.page;
    } else {
      const fallback = filterStatic(opts);
      products = fallback.items;
      totalPages = fallback.totalPages;
      page = fallback.page;
    }
  }

  async function loadProductBySlug(slug: string): Promise<ExpandedProduct | null> {
    const [result] = await safeCall(() =>
      pb.collection('products').getFirstListItem(`slug = "${safe(slug)}"`, {
        expand: 'category',
      }),
      { silent: true }
    );
    if (result) return result as unknown as ExpandedProduct;
    return staticMapped.find(p => p.slug === slug) ?? null;
  }

  async function loadFeatured() {
    const [result] = await safeCall(() =>
      pb.collection('products').getList(1, 8, {
        expand: 'category',
        sort: '-name',
      }),
      { silent: true }
    );
    if (result && result.items.length > 0) {
      products = result.items as unknown as ExpandedProduct[];
    } else {
      products = staticMapped.filter(p => p.featured);
    }
  }

  async function loadBanners() {
    const [result] = await safeCall(() =>
      pb.collection('banners').getFullList({
        sort: 'sort_order',
      }),
      { silent: true }
    );
    if (result) banners = result as unknown as BannersRecord[];
  }

  async function loadTestimonials() {
    const [result] = await safeCall(() =>
      pb.collection('testimonials').getFullList({
        sort: 'sort_order',
      }),
      { silent: true }
    );
    if (result) testimonials = result as unknown as TestimonialsRecord[];
  }

  return {
    get products() { return products; },
    get categories() { return categories; },
    get banners() { return banners; },
    get testimonials() { return testimonials; },
    get loading() { return loading; },
    get page() { return page; },
    get totalPages() { return totalPages; },
    loadProducts,
    loadProductBySlug,
    loadFeatured,
    loadCategories,
    loadBanners,
    loadTestimonials,
  };
}

export type ProductsStore = ReturnType<typeof createProductsStore>;

const PRODUCTS_CONTEXT_KEY = Symbol('products');

export function setProductsContext() {
  const store = createProductsStore();
  setContext(PRODUCTS_CONTEXT_KEY, store);
  return store;
}

export function getProductsContext() {
  return getContext<ProductsStore>(PRODUCTS_CONTEXT_KEY);
}
