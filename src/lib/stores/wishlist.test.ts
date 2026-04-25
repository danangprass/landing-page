import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setWishlistContext } from './wishlist.svelte';
import { setAuthContext } from './auth.svelte';

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
        authStore: {
            isValid: true,
            record: { id: 'test-user', email: 'test@example.com', name: 'Test' },
            onChange: vi.fn(),
            clear: vi.fn(),
        },
        collection: vi.fn(() => ({
            getFullList: vi.fn(() => Promise.resolve([])),
            create: vi.fn(),
            delete: vi.fn(),
        })),
    }
}));

vi.mock('$lib/pb-error-handler.svelte', () => ({
    safeCall: vi.fn(async (cb) => {
        try {
            const res = await cb();
            return [res, null];
        } catch (e) {
            return [null, e];
        }
    }),
    showToast: vi.fn(),
}));

describe('Wishlist Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty items', () => {
        setAuthContext();
        const list = setWishlistContext();
        expect(list.items).toEqual([]);
        expect(list.loading).toBe(false);
    });
});
