import { getContext, setContext } from 'svelte';
import { page } from '$app/state';
import { pb } from '$lib/pb';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	isSuperuser?: boolean;
}

function createAuthStore() {
	let user = $state<AuthUser | null>(null);
	let loading = $state(false);
	let pendingAuthSync = $state(false);
	let pendingAuthSyncTimeout: ReturnType<typeof setTimeout> | null = null;

	// Initialize from server-side user data (httpOnly cookie is never exposed to JS)
	function syncFromPageData() {
		const u = page.data?.user as Record<string, unknown> | null;
		if (u) {
			user = {
				id: u.id as string,
				email: u.email as string,
				name: u.name as string,
				avatar: u.avatar as string | undefined,
				isSuperuser: (u.isSuperuser as boolean) ?? false,
			};
			pendingAuthSync = false;
			if (pendingAuthSyncTimeout) {
				clearTimeout(pendingAuthSyncTimeout);
				pendingAuthSyncTimeout = null;
			}
		} else if (!pendingAuthSync) {
			// Only clear auth state if we are not expecting a post-login/register
			// page-data sync. This prevents brief nulls during client-side
			// navigation from wiping a user that was just set by login/register.
			user = null;
		}
		// If pendingAuthSync is true and page.data.user is null, we keep the
		// existing user state until the layout load returns the server-side
		// auth state or the safety timeout expires.
	}

	syncFromPageData();

	// React to navigation / form action results that update page.data
	// Wrap in try/catch so unit tests (outside component context) don't crash
	try {
		$effect(() => {
			// Track page.data.user reactively
			const _ = page.data?.user;
			syncFromPageData();
		});
	} catch {
		// Outside Svelte component context — ignore
	}

	async function login(email: string, password: string) {
		loading = true;
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);

		const [result, err] = await safeCall(() =>
			fetch('/login?/login', {
				method: 'POST',
				body: formData,
			}).then(async (res) => {
				const data = await res.json();
				if (data.type === 'failure') {
					throw new Error(data.data?.error || 'Invalid email or password.');
				}
				if (data.data?.user) {
					user = {
						id: data.data.user.id,
						email: data.data.user.email,
						name: data.data.user.name,
						avatar: data.data.user.avatar,
					};
					pendingAuthSync = true;
					if (pendingAuthSyncTimeout) clearTimeout(pendingAuthSyncTimeout);
					pendingAuthSyncTimeout = setTimeout(() => {
						pendingAuthSync = false;
					}, 3000);
				}
				return data;
			})
		);
		loading = false;
		if (err) return false;
		showToast('Welcome back!', 'success');
		return true;
	}

	async function register(data: { name: string; email: string; password: string; passwordConfirm: string }) {
		loading = true;
		const formData = new FormData();
		formData.append('name', data.name);
		formData.append('email', data.email);
		formData.append('password', data.password);
		formData.append('passwordConfirm', data.passwordConfirm);

		const [result, err] = await safeCall(() =>
			fetch('/register?/register', {
				method: 'POST',
				body: formData,
			}).then(async (res) => {
				const json = await res.json();
				if (json.type === 'failure') {
					throw new Error(json.data?.error || 'Registration failed.');
				}
				if (json.data?.user) {
					user = {
						id: json.data.user.id,
						email: json.data.user.email,
						name: json.data.user.name,
						avatar: json.data.user.avatar,
					};
					pendingAuthSync = true;
					if (pendingAuthSyncTimeout) clearTimeout(pendingAuthSyncTimeout);
					pendingAuthSyncTimeout = setTimeout(() => {
						pendingAuthSync = false;
					}, 3000);
				}
				return json;
			})
		);
		loading = false;
		if (err) return false;
		showToast('Account created successfully!', 'success');
		return true;
	}

	async function logout() {
		const [, err] = await safeCall(() =>
			fetch('/logout', { method: 'POST' }).then((res) => res.json())
		);
		user = null;
		pendingAuthSync = false;
		if (pendingAuthSyncTimeout) {
			clearTimeout(pendingAuthSyncTimeout);
			pendingAuthSyncTimeout = null;
		}
		pb.authStore.clear();
		showToast('Signed out', 'info');
	}

	async function refresh() {
		// Auth state is server-side; trigger a navigation to refresh page.data
		window.location.reload();
		return true;
	}

	return {
		get user() { return user; },
		get isLoggedIn() { return user !== null; },
		get isSuperuser() { return user?.isSuperuser ?? false; },
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
