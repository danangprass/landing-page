import { describe, it, expect, vi, beforeEach } from 'vitest';
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
            isValid: false,
            record: null,
            onChange: vi.fn(),
            clear: vi.fn(),
        },
        collection: vi.fn(() => ({
            authWithPassword: vi.fn(),
            create: vi.fn(),
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
    ensureAuth: vi.fn(() => Promise.resolve(true)),
}));

describe('Auth Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes correctly empty state', () => {
        const store = setAuthContext();
        expect(store.user).toBeNull();
        expect(store.isLoggedIn).toBe(false);
        expect(store.loading).toBe(false);
    });
});
