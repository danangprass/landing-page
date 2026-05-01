<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let successMessage = $state('');
	let submitting = $state(false);

	// Derive field errors from form response
	let nameError = $derived(form?.errors?.name ?? '');
	let phoneError = $derived(form?.errors?.phone ?? '');
	let serverError = $derived(form?.error ?? '');

	// Show success message and clear after a delay
	$effect(() => {
		if (form?.success) {
			successMessage = form.message ?? 'Profile updated successfully.';
			const timer = setTimeout(() => {
				successMessage = '';
			}, 4000);
			return () => clearTimeout(timer);
		}
	});

	// Track submit state
	function handleSubmit() {
		submitting = true;
		successMessage = '';
	}

	function handleFormResult() {
		submitting = false;
	}

	// Reveal animation observer
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
</script>

<svelte:head>
	<title>My Profile — ElectraStore</title>
</svelte:head>

<div class="profile-page">
	<div class="profile-card reveal" style="--stagger-index: 0">
		<a href="/" class="profile-logo" aria-label="ElectraStore home">
			Electra<span class="profile-logo-accent">Store</span>
		</a>

		<h1 class="profile-title">My Profile</h1>
		<p class="profile-subtitle">View and edit your personal information.</p>

		{#if successMessage}
			<div class="profile-success" role="status">{successMessage}</div>
		{/if}

		{#if serverError}
			<div class="profile-error" role="alert">{serverError}</div>
		{/if}

		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				handleSubmit();
				return async ({ result }) => {
					handleFormResult();
				};
			}}
			class="profile-form"
		>
			<!-- Name -->
			<div class="field-group">
				<label for="name" class="field-label">Full Name</label>
				<input
					id="name"
					name="name"
					type="text"
					class="field-input"
					class:field-input--error={!!nameError}
					value={form?.values?.name ?? data.user.name}
					placeholder="Your full name"
					autocomplete="name"
					required
				/>
				{#if nameError}
					<span class="field-error">{nameError}</span>
				{/if}
			</div>

			<!-- Email (read-only) -->
			<div class="field-group">
				<label for="email" class="field-label">Email</label>
				<input
					id="email"
					type="email"
					class="field-input field-input--readonly"
					value={data.user.email}
					readonly
					disabled
				/>
				<span class="field-hint">Email cannot be changed.</span>
			</div>

			<!-- Phone -->
			<div class="field-group">
				<label for="phone" class="field-label">Phone</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					class="field-input"
					class:field-input--error={!!phoneError}
					value={form?.values?.phone ?? data.user.phone}
					placeholder="+1 (555) 000-0000"
					autocomplete="tel"
				/>
				{#if phoneError}
					<span class="field-error">{phoneError}</span>
				{/if}
			</div>

			<!-- Address -->
			<div class="field-group">
				<label for="address" class="field-label">Address</label>
				<textarea
					id="address"
					name="address"
					class="field-input field-textarea"
					placeholder="Your full address"
					autocomplete="street-address"
					rows="3"
				>{form?.values?.address ?? data.user.address}</textarea>
			</div>

			<button type="submit" class="btn-primary profile-submit" disabled={submitting}>
				{#if submitting}
					<span class="spinner"></span>
					Saving…
				{:else}
					Save Changes
				{/if}
			</button>
		</form>
	</div>
</div>

<style>
	.profile-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5rem 1rem 2rem;
	}

	.profile-card {
		width: 100%;
		max-width: 480px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 2.5rem;
		border: 1px solid var(--color-border);
	}

	.profile-logo {
		display: inline-block;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-decoration: none;
		letter-spacing: -0.025em;
		transition: transform 160ms var(--ease-out);
	}
	.profile-logo:active {
		transform: scale(0.97);
	}

	.profile-logo-accent {
		color: var(--color-accent);
	}

	.profile-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-top: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.profile-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	.profile-success {
		background-color: rgba(48, 209, 88, 0.15);
		border: 1px solid rgba(48, 209, 88, 0.4);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: var(--color-success);
		margin-bottom: 1rem;
	}

	.profile-error {
		background-color: rgba(255, 69, 58, 0.15);
		border: 1px solid rgba(255, 69, 58, 0.4);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.profile-form {
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

	.field-input--error {
		border-color: var(--color-error);
	}
	.field-input--error:focus {
		border-color: var(--color-error);
	}

	.field-input--readonly {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.field-textarea {
		resize: vertical;
		min-height: 5rem;
		font-family: inherit;
	}

	.field-error {
		font-size: 0.8125rem;
		color: var(--color-error);
	}

	.field-hint {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.profile-submit {
		width: 100%;
		margin-top: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.profile-submit:disabled {
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

	@media (prefers-reduced-motion: reduce) {
		.profile-logo,
		.profile-card {
			transition: none;
		}
		.profile-card {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.spinner {
			animation-duration: 1000ms;
		}
	}
</style>
