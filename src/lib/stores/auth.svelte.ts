import { getContext, setContext } from 'svelte';
import { pb } from '$lib/pb';
import { safeCall, showToast, ensureAuth } from '$lib/pb-error-handler.svelte';
import type { UsersRecord } from '$lib/pb-types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

function createAuthStore() {
  let user = $state<AuthUser | null>(null);
  let loading = $state(false);

  // Initialize from PB auth store (cookie-based)
  if (pb.authStore.isValid) {
    const model = pb.authStore.record as Record<string, unknown> | null;
    if (model) {
      user = {
        id: model.id as string,
        email: model.email as string,
        name: model.name as string,
        avatar: model.avatar as string | undefined,
      };
    }
  }

  // React to auth state changes (cookie persistence handled in pb.ts)
  pb.authStore.onChange((_token, model) => {
    if (model && pb.authStore.isValid) {
      user = {
        id: (model as Record<string, unknown>).id as string,
        email: (model as Record<string, unknown>).email as string,
        name: (model as Record<string, unknown>).name as string,
        avatar: (model as Record<string, unknown>).avatar as string | undefined,
      };
    } else {
      user = null;
    }
  });

  async function login(email: string, password: string) {
    loading = true;
    const [result, err] = await safeCall(() =>
      pb.collection('users').authWithPassword(email, password)
    );
    loading = false;
    if (err) return false;
    showToast('Welcome back!', 'success');
    return true;
  }

  async function register(data: { name: string; email: string; password: string; passwordConfirm: string }) {
    loading = true;
    const [, err] = await safeCall(() =>
      pb.collection('users').create(data)
    );
    if (err) {
      loading = false;
      return false;
    }
    // Auto-login after registration
    const [loginResult, loginErr] = await safeCall(() =>
      pb.collection('users').authWithPassword(data.email, data.password)
    );
    loading = false;
    if (loginErr) return false;
    showToast('Account created successfully!', 'success');
    return true;
  }

  async function logout() {
    pb.authStore.clear();
    showToast('Signed out', 'info');
  }

  async function refresh() {
    const valid = await ensureAuth();
    if (!valid) {
      user = null;
    }
    return valid;
  }

  return {
    get user() { return user; },
    get isLoggedIn() { return user !== null && pb.authStore.isValid; },
    get loading() { return loading; },
    login,
    register,
    logout,
    refresh,
  };
}

export type AuthStore = ReturnType<typeof createAuthStore>;

const AUTH_CONTEXT_KEY = Symbol('auth');

export function setAuthContext() {
  const auth = createAuthStore();
  setContext(AUTH_CONTEXT_KEY, auth);
  return auth;
}

export function getAuthContext() {
  return getContext<AuthStore>(AUTH_CONTEXT_KEY);
}