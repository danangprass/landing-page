<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let clientError = $state('');

	const auth = getAuthContext();

	function safeRedirect(url: string | null): string {
		if (!url) return '/';
		let decoded: string;
		try {
			decoded = decodeURIComponent(url);
		} catch {
			return '/';
		}
		const lower = decoded.toLowerCase().trim();
		if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
			return '/';
		}
		if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) {
			return '/';
		}
		return decoded;
	}

	// Reveal animation: add .visible to all .reveal elements when they enter the viewport
	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.1 }
		);
		const elements = document.querySelectorAll('.reveal');
		for (const el of elements) {
			observer.observe(el);
		}
		return () => observer.disconnect();
	});

	// Redirect if already logged in
	$effect(() => {
		if (auth.isLoggedIn) {
			goto(safeRedirect(page.url.searchParams.get('redirect')));
		}
	});

	// Show server validation errors
	$effect(() => {
		if (form?.error) {
			clientError = form.error;
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		clientError = '';
		loading = true;
		const success = await auth.login(email, password);
		loading = false;
		if (success) {
			goto(safeRedirect(page.url.searchParams.get('redirect')));
		} else {
			clientError = 'Invalid email or password. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>Sign In — ElectraStore</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card reveal" style="--stagger-index: 0">
		<a href="/" class="auth-logo" aria-label="ElectraStore home">
			Electra<span class="auth-logo-accent">Store</span>
		</a>

		<h1 class="auth-title">Sign in</h1>
		<p class="auth-subtitle">Welcome back. Sign in to your account.</p>

		{#if clientError}
			<div class="auth-error" role="alert">{clientError}</div>
		{/if}

		<form onsubmit={handleSubmit} class="auth-form">
			<div class="field-group">
				<label for="email" class="field-label">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					bind:value={email}
					class="field-input"
					placeholder="you@example.com"
					autocomplete="email"
					required
				/>
			</div>

			<div class="field-group">
				<label for="password" class="field-label">Password</label>
				<div class="field-input-wrap">
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						class="field-input field-input--has-toggle"
						placeholder="Enter your password"
						autocomplete="current-password"
						required
					/>
					<button
						type="button"
						class="password-toggle"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23" /></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
						{/if}
					</button>
				</div>
			</div>

			<div class="auth-options">
				<a href="/forgot-password" class="auth-link">Forgot password?</a>
			</div>

			<button type="submit" class="btn-primary auth-submit" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					Signing in…
				{:else}
					Sign In
				{/if}
			</button>
		</form>

		<p class="auth-footer">
			Don't have an account? <a href="/register" class="auth-link">Create one</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 2.5rem;
		border: 1px solid var(--color-border);
	}

	.auth-logo {
		display: inline-block;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-decoration: none;
		letter-spacing: -0.025em;
		transition: transform 160ms var(--ease-out);
	}
	.auth-logo:active {
		transform: scale(0.97);
	}

	.auth-logo-accent {
		color: var(--color-accent);
	}

	.auth-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-top: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.auth-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	.auth-error {
		background-color: rgba(255, 69, 58, 0.15);
		border: 1px solid rgba(255, 69, 58, 0.4);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.field-input {
		width: 100%;
		background-color: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;
		transition: border-color 160ms var(--ease-out);
	}
	.field-input::placeholder {
		color: var(--color-text-secondary);
	}
	.field-input:focus {
		border-color: var(--color-accent);
	}

	.field-input-wrap {
		position: relative;
	}
	.field-input--has-toggle {
		padding-right: 2.75rem;
	}

	.password-toggle {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 160ms var(--ease-out), transform 160ms var(--ease-out);
	}
	.password-toggle:active {
		transform: translateY(-50%) scale(0.97);
	}
	@media (hover: hover) and (pointer: fine) {
		.password-toggle:hover {
			color: var(--color-text-primary);
		}
	}

	.auth-options {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.auth-link {
		font-size: 0.875rem;
		color: var(--color-accent);
		text-decoration: none;
		transition: color 160ms var(--ease-out);
	}
	.auth-link:active {
		transform: scale(0.97);
	}
	@media (hover: hover) and (pointer: fine) {
		.auth-link:hover {
			color: var(--color-accent-hover);
		}
	}

	.auth-submit {
		width: 100%;
		margin-top: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.auth-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--color-bg);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 600ms linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.auth-footer {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		text-align: center;
		margin-top: 1.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.auth-logo,
		.password-toggle,
		.auth-link {
			transition: none;
		}
		.auth-card {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.spinner {
			animation-duration: 1000ms;
		}
	}
</style>
