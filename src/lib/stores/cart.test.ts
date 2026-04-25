import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setCartContext } from './cart.svelte';
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
            update: vi.fn(),
            subscribe: vi.fn(() => Promise.resolve(() => { })),
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

describe('Cart Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty items', () => {
        setAuthContext(); // Needs auth context setup first
        const cart = setCartContext();
        expect(cart.items).toEqual([]);
        expect(cart.loading).toBe(false);
        expect(cart.adding).toBe(false);
        expect(cart.count).toBe(0);
        expect(cart.subtotal).toBe(0);
    });
});
