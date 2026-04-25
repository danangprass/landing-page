import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setProductsContext } from './products.svelte';

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
        })),
    }
}));

describe('Products Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes correctly empty state', () => {
        const store = setProductsContext();
        expect(store.products).toEqual([]);
        expect(store.loading).toBe(false);
    });
});
