import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_PB_URL: 'http://localhost:8090' }
}));

vi.mock('svelte', async (importOriginal) => {
    const actual = await importOriginal<typeof import('svelte')>();
    const contextMap = new Map();
    return {
        ...actual,
        getContext: vi.fn((key) => contextMap.get(key)),
        setContext: vi.fn((key, val) => {
            contextMap.set(key, val);
        }),
    };
});

vi.mock('$lib/pb', () => ({
    pb: {
        collection: vi.fn(() => ({
            getList: vi.fn(() => Promise.resolve({ items: [], totalItems: 0 })),
            getFullList: vi.fn(() => Promise.resolve([])),
            getFirstListItem: vi.fn(() => Promise.resolve(null)),
        })),
        files: { getUrl: vi.fn(() => 'http://localhost:8090/api/files/test/img.webp') },
        authStore: {
            isValid: false,
            save: vi.fn(),
            clear: vi.fn(),
            onChange: vi.fn(),
        },
    }
}));

vi.mock('$lib/pb-error-handler.svelte', () => ({
    safeCall: vi.fn(),
}));

import { setProductsContext } from './products.svelte';
import { products as staticProducts } from '$lib/data/products';
import { safeCall } from '$lib/pb-error-handler.svelte';

describe('Products Store — Data Retrieval (Whitebox)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty products and not loading', () => {
        const store = setProductsContext();
        expect(store.products).toEqual([]);
        expect(store.loading).toBe(false);
        expect(store.categories).toEqual([]);
    });

    describe('loadProducts', () => {
        it('falls back to static data when PocketBase returns empty', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts();

            expect(store.loading).toBe(false);
            expect(store.products.length).toBeGreaterThan(0);
            expect(store.products[0].name).toBe(staticProducts[0].name);
        });

        it('falls back to static data filtered by category', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            // First safeCall: category lookup returns null
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Not found', type: 'error' }]);
            // Second safeCall: products list returns null
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts({ category: 'phones' });

            const allPhones = staticProducts.filter(p => p.categorySlug === 'phones');
            expect(store.products.length).toBe(allPhones.length);
            expect(store.products.every(p => p.expand?.category?.slug === 'phones')).toBe(true);
        });

        it('falls back to static data filtered by search term', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts({ search: 'prophone' });

            const expected = staticProducts.filter(p =>
                p.name.toLowerCase().includes('prophone') || p.slug.toLowerCase().includes('prophone')
            );
            expect(store.products.length).toBe(expected.length);
        });

        it('falls back to featured static products', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts({ featured: true });

            const featured = staticProducts.filter(p => p.badge === 'new');
            expect(store.products.length).toBe(featured.length);
        });

        it('uses PocketBase data when available', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            const pbProduct = {
                id: 'pb-1',
                name: 'PB Product',
                slug: 'pb-product',
                price: 999,
                description: 'From PB',
                images: ['img.webp'],
                featured: true,
                stock: 10,
                active: true,
                sku: 'pb-1',
                expand: { category: { id: 'cat-1', name: 'Test', slug: 'test', active: true } },
            };
            mockedSafeCall.mockResolvedValueOnce([{
                items: [pbProduct],
                totalPages: 1,
                page: 1,
            }, null]);

            const store = setProductsContext();
            await store.loadProducts();

            expect(store.products.length).toBe(1);
            expect(store.products[0].name).toBe('PB Product');
            expect(store.totalPages).toBe(1);
            expect(store.page).toBe(1);
        });

        it('sets loading state correctly during fetch', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            let resolveFn: (v: [{ items: never[]; totalPages: number; page: number }, null]) => void;
            const promise = new Promise<[{ items: never[]; totalPages: number; page: number }, null]>((resolve) => { resolveFn = resolve; });
            mockedSafeCall.mockReturnValueOnce(promise);

            const store = setProductsContext();
            const loadPromise = store.loadProducts();

            expect(store.loading).toBe(true);

            resolveFn!([{ items: [], totalPages: 1, page: 1 }, null]);
            await loadPromise;

            expect(store.loading).toBe(false);
        });
    });

    describe('loadProductBySlug', () => {
        it('falls back to static data when PB product not found', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Not found', type: 'error' }]);

            const store = setProductsContext();
            const product = await store.loadProductBySlug('prophone-16-pro');

            expect(product).not.toBeNull();
            expect(product?.name).toBe('ProPhone 16 Pro');
        });

        it('returns null for unknown slug when PB fails', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Not found', type: 'error' }]);

            const store = setProductsContext();
            const product = await store.loadProductBySlug('nonexistent-slug');

            expect(product).toBeNull();
        });

        it('returns PB product when found', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            const pbProduct = {
                id: 'pb-1',
                name: 'PB Product',
                slug: 'pb-product',
                price: 999,
                description: 'From PB',
                images: ['img.webp'],
                featured: true,
                stock: 10,
                active: true,
                sku: 'pb-1',
                expand: { category: { id: 'cat-1', name: 'Test', slug: 'test', active: true } },
            };
            mockedSafeCall.mockResolvedValueOnce([pbProduct, null]);

            const store = setProductsContext();
            const product = await store.loadProductBySlug('pb-product');

            expect(product?.name).toBe('PB Product');
        });
    });

    describe('loadFeatured', () => {
        it('falls back to static featured products when PB empty', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadFeatured();

            const featuredSlugs = staticProducts
                .filter(p => p.badge === 'new')
                .map(p => p.slug);
            expect(store.products.length).toBe(featuredSlugs.length);
            expect(store.products.map(p => p.slug)).toEqual(featuredSlugs);
        });
    });

    describe('loadCategories', () => {
        it('falls back to static categories when PB empty', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadCategories();

            expect(store.categories.length).toBeGreaterThan(0);
            const staticCats = [...new Map(staticProducts.map(p => [p.categorySlug, { name: p.category, slug: p.categorySlug }])).values()];
            expect(store.categories.length).toBe(staticCats.length);
        });
    });

    describe('loadBanners', () => {
        it('loads banners from PocketBase', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            const banner = { id: 'b1', title: 'Sale', image: 'banner.webp', sort_order: 1, active: true };
            mockedSafeCall.mockResolvedValueOnce([[banner], null]);

            const store = setProductsContext();
            await store.loadBanners();

            expect(store.banners.length).toBe(1);
            expect(store.banners[0].title).toBe('Sale');
        });
    });

    describe('loadTestimonials', () => {
        it('loads testimonials from PocketBase', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            const testimonial = { id: 't1', name: 'John', quote: 'Great!', sort_order: 1, active: true };
            mockedSafeCall.mockResolvedValueOnce([[testimonial], null]);

            const store = setProductsContext();
            await store.loadTestimonials();

            expect(store.testimonials.length).toBe(1);
            expect(store.testimonials[0].name).toBe('John');
        });
    });

    describe('static data mapping correctness', () => {
        it('maps all static products with correct fields', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts();

            expect(store.products.length).toBe(staticProducts.length);

            for (let i = 0; i < staticProducts.length; i++) {
                const staticP = staticProducts[i];
                const mappedP = store.products[i];
                expect(mappedP.id).toBe(staticP.id);
                expect(mappedP.slug).toBe(staticP.slug);
                expect(mappedP.name).toBe(staticP.name);
                expect(mappedP.price).toBe(staticP.price);
                expect(mappedP.description).toBe(staticP.description);
                expect(mappedP.featured).toBe(staticP.badge === 'new');
                expect(mappedP.stock).toBe(staticP.inStock ? 99 : 0);
                expect(mappedP.active).toBe(true);
                expect(mappedP.sku).toBe(staticP.slug);
                expect(mappedP.expand?.category?.slug).toBe(staticP.categorySlug);
                expect(mappedP.expand?.category?.name).toBe(staticP.category);
            }
        });

        it('maps static product images correctly', async () => {
            const mockedSafeCall = vi.mocked(safeCall);
            mockedSafeCall.mockResolvedValueOnce([null, { message: 'Network error', type: 'error' }]);

            const store = setProductsContext();
            await store.loadProducts();

            const firstProduct = store.products[0];
            expect(Array.isArray(firstProduct.images)).toBe(true);
            expect(firstProduct.images?.length).toBeGreaterThan(0);
            expect(typeof firstProduct.images?.[0]).toBe('string');
        });
    });
});
