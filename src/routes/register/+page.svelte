<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuthContext } from '$lib/stores/auth.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let error = $state('');
  let agreeTerms = $state(false);
  let fieldErrors = $state<Record<string, string>>({});

  const auth = getAuthContext();

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
      goto('/');
    }
  });

  let passwordStrength = $derived.by(() => {
    if (!password) return '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    if (score <= 3) return 'good';
    return 'strong';
  });

  let passwordsMatch = $derived(confirmPassword === '' || password === confirmPassword);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    fieldErrors = {};
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    if (!password) errs.password = 'Password is required.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    if (password && confirmPassword && !passwordsMatch) errs.confirmPassword = 'Passwords do not match.';
    if (!agreeTerms) errs.terms = 'You must agree to the Terms of Service.';
    if (Object.keys(errs).length > 0) {
      fieldErrors = errs;
      return;
    }
    error = '';
    loading = true;
    const success = await auth.register({ name: name.trim(), email: email.trim(), password, passwordConfirm: confirmPassword });
    loading = false;
    if (success) {
      goto('/');
    } else {
      error = 'Could not create account. Please try again.';
    }
  }
</script>

<svelte:head>
  <title>Create Account — ElectraStore</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card reveal" style="--stagger-index: 0">
    <a href="/" class="auth-logo" aria-label="ElectraStore home">
      Electra<span class="auth-logo-accent">Store</span>
    </a>

    <h1 class="auth-title">Create your account</h1>
    <p class="auth-subtitle">Join ElectraStore for premium electronics.</p>

    {#if error}
      <div class="auth-error" role="alert">{error}</div>
    {/if}

    <form onsubmit={handleSubmit} class="auth-form">
      <div class="field-group">
        <label for="name" class="field-label">Full Name</label>
        <input id="name" type="text" bind:value={name} class="field-input" class:field-input--error={!!fieldErrors.name} placeholder="Your full name" autocomplete="name" />
        {#if fieldErrors.name}<span class="field-error">{fieldErrors.name}</span>{/if}
      </div>

      <div class="field-group">
        <label for="email" class="field-label">Email</label>
        <input id="email" type="email" bind:value={email} class="field-input" class:field-input--error={!!fieldErrors.email} placeholder="you@example.com" autocomplete="email" />
        {#if fieldErrors.email}<span class="field-error">{fieldErrors.email}</span>{/if}
      </div>

      <div class="field-group">
        <label for="password" class="field-label">Password</label>
        <div class="field-input-wrap">
          <input id="password" type={showPassword ? 'text' : 'password'} bind:value={password} class="field-input field-input--has-toggle" class:field-input--error={!!fieldErrors.password} placeholder="Create a password" autocomplete="new-password" />
          <button type="button" class="password-toggle" onclick={() => (showPassword = !showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23" /></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {/if}
          </button>
        </div>
        {#if fieldErrors.password}<span class="field-error">{fieldErrors.password}</span>{/if}
        {#if password}
          <div class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill strength-fill-{passwordStrength}"></div>
            </div>
            <span class="strength-label strength-label-{passwordStrength}">
              {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'fair' ? 'Fair' : passwordStrength === 'good' ? 'Good' : 'Strong'}
            </span>
          </div>
        {/if}
      </div>

      <div class="field-group">
        <label for="confirm-password" class="field-label">Confirm Password</label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          bind:value={confirmPassword}
          class="field-input"
          class:field-input--error={!!fieldErrors.confirmPassword || (!passwordsMatch && confirmPassword !== '')}
          placeholder="Confirm your password"
          autocomplete="new-password"
        />
        {#if fieldErrors.confirmPassword}
          <span class="field-error">{fieldErrors.confirmPassword}</span>
        {:else if !passwordsMatch && confirmPassword !== ''}
          <span class="field-error">Passwords do not match</span>
        {/if}
      </div>

      <div>
        <label class="checkbox-label" class:checkbox-label--error={!!fieldErrors.terms}>
          <input type="checkbox" class="checkbox-input" bind:checked={agreeTerms} />
          <span class="checkbox-custom" class:checkbox-custom--error={!!fieldErrors.terms}></span>
          <span class="checkbox-text">I agree to the <a href="/terms" class="auth-link">Terms of Service</a> and <a href="/privacy" class="auth-link">Privacy Policy</a></span>
        </label>
        {#if fieldErrors.terms}<span class="field-error">{fieldErrors.terms}</span>{/if}
      </div>

      <button type="submit" class="btn-primary auth-submit" disabled={loading}>
        {#if loading}
          <span class="spinner"></span>
          Creating account…
        {:else}
          Create Account
        {/if}
      </button>
    </form>

    <div class="auth-divider">
      <span class="auth-divider-text">or</span>
    </div>

    <button type="button" class="auth-social-btn">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.88 0-1.1.587-2.27 1.284-3 .75-.78 2.06-1.42 3.06-1.47.03.23.04.53.04.84zM19.14 18.75c-.47 1.11-1.01 2.16-1.73 3.07-1.01 1.43-2.06 2.86-3.65 2.89-1.55.03-2.05-1.06-3.83-1.06-1.78 0-2.34 1.03-3.81 1.09-1.55.06-2.73-1.58-3.75-3.01-2.56-3.62-4.52-10.24-1.89-14.72 1.3-2.21 3.63-3.61 6.15-3.65 1.55-.03 3.01 1.06 3.95 1.06.94 0 2.71-1.31 4.56-.56.78.3 2.99 1.22 3.41 3.92-.09.06-2.34 1.37-2.37 4.09-.03 3.29 2.89 4.46 2.92 4.47-.03.08-.44 1.54-1.47 3.02l.31-.17z" /></svg>
      Continue with Apple
    </button>

    <button type="button" class="auth-social-btn">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with Google
    </button>

    <p class="auth-footer">
      Already have an account? <a href="/login" class="auth-link">Sign in</a>
    </p>
  </div>
</div>

<style>
  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
  .auth-card { width: 100%; max-width: 420px; background-color: var(--color-surface); border-radius: var(--radius-lg); padding: 2.5rem; border: 1px solid var(--color-border); }
  .auth-logo { display: inline-block; font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); text-decoration: none; letter-spacing: -0.025em; transition: transform 160ms var(--ease-out); }
  .auth-logo:active { transform: scale(0.97); }
  .auth-logo-accent { color: var(--color-accent); }
  .auth-title { font-size: 1.75rem; font-weight: 600; color: var(--color-text-primary); margin-top: 1.5rem; margin-bottom: 0.25rem; }
  .auth-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1.5rem; }
  .auth-error { background-color: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.4); border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--color-error); margin-bottom: 1rem; }
  .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
  .field-group { display: flex; flex-direction: column; gap: 0.375rem; }
  .field-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
  .field-input { width: 100%; background-color: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.9375rem; color: var(--color-text-primary); outline: none; transition: border-color 160ms var(--ease-out); }
  .field-input::placeholder { color: var(--color-text-secondary); }
  .field-input:focus { border-color: var(--color-accent); }
  .field-input--error { border-color: var(--color-error); }
  .field-input--error:focus { border-color: var(--color-error); }
  .field-input-wrap { position: relative; }
  .field-input--has-toggle { padding-right: 2.75rem; }
  .password-toggle { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: 0.375rem; display: flex; align-items: center; justify-content: center; transition: color 160ms var(--ease-out), transform 160ms var(--ease-out); }
  .password-toggle:active { transform: translateY(-50%) scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .password-toggle:hover { color: var(--color-text-primary); } }
  .field-error { font-size: 0.75rem; color: var(--color-error); }
  .password-strength { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.375rem; }
  .strength-bar { flex: 1; height: 3px; background-color: var(--color-border); border-radius: 2px; overflow: hidden; }
  .strength-fill { height: 100%; border-radius: 2px; transition: width 250ms var(--ease-out), background-color 250ms var(--ease-out); }
  .strength-fill-weak { width: 25%; background-color: var(--color-error); }
  .strength-fill-fair { width: 50%; background-color: var(--color-warning); }
  .strength-fill-good { width: 75%; background-color: var(--color-accent); }
  .strength-fill-strong { width: 100%; background-color: var(--color-success); }
  .strength-label { font-size: 0.75rem; min-width: 3rem; }
  .strength-label-weak { color: var(--color-error); }
  .strength-label-fair { color: var(--color-warning); }
  .strength-label-good { color: var(--color-accent); }
  .strength-label-strong { color: var(--color-success); }
  .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
  .checkbox-input { display: none; }
  .checkbox-custom { width: 1.125rem; height: 1.125rem; border-radius: 4px; border: 1.5px solid var(--color-border); display: flex; align-items: center; justify-content: center; transition: background-color 160ms var(--ease-out), border-color 160ms var(--ease-out); flex-shrink: 0; }
  .checkbox-input:checked + .checkbox-custom { background-color: var(--color-accent); border-color: var(--color-accent); }
  .checkbox-input:checked + .checkbox-custom::after { content: ''; display: block; width: 5px; height: 9px; border: solid var(--color-bg); border-width: 0 2px 2px 0; transform: rotate(45deg) translateY(-1px); }
  .checkbox-input:focus-visible + .checkbox-custom { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .checkbox-text { font-size: 0.875rem; color: var(--color-text-secondary); }
  .checkbox-custom--error { border-color: var(--color-error); }
  .auth-link { color: var(--color-accent); text-decoration: none; transition: color 160ms var(--ease-out); }
  .auth-link:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .auth-link:hover { color: var(--color-accent-hover); } }
  .auth-submit { width: 100%; margin-top: 0.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .spinner { width: 1rem; height: 1rem; border: 2px solid var(--color-bg); border-top-color: transparent; border-radius: 50%; animation: spin 600ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background-color: var(--color-border); }
  .auth-divider-text { font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .auth-social-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.625rem; padding: 0.75rem 1rem; background-color: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); font-size: 0.9375rem; font-weight: 500; cursor: pointer; margin-bottom: 0.75rem; transition: transform 160ms var(--ease-out), background-color 200ms var(--ease-out), border-color 200ms var(--ease-out); }
  .auth-social-btn:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .auth-social-btn:hover { background-color: var(--color-surface-hover); border-color: var(--color-text-secondary); } }
  .auth-footer { font-size: 0.875rem; color: var(--color-text-secondary); text-align: center; margin-top: 1.5rem; }
  @media (prefers-reduced-motion: reduce) { .auth-logo, .auth-social-btn, .password-toggle, .auth-link { transition: none; } .auth-card { animation: none; opacity: 1; transform: none; } .spinner { animation-duration: 1000ms; } }
</style>