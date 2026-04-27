import { getContext, setContext } from 'svelte';
import { page } from '$app/state';
import { pb } from '$lib/pb';
import { safeCall, showToast } from '$lib/pb-error-handler.svelte';

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

function createAuthStore() {
	let user = $state<AuthUser | null>(null);
	let loading = $state(false);

	// Initialize from server-side user data (httpOnly cookie is never exposed to JS)
	function syncFromPageData() {
		const u = page.data?.user as Record<string, unknown> | null;
		if (u) {
			user = {
				id: u.id as string,
				email: u.email as string,
				name: u.name as string,
				avatar: u.avatar as string | undefined,
			};
		} else {
			user = null;
		}
	}

	syncFromPageData();

	// React to navigation / form action results that update page.data
	$effect(() => {
		// Track page.data.user reactively
		const _ = page.data?.user;
		syncFromPageData();
	});

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
