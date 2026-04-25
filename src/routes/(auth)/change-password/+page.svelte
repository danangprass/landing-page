<script lang="ts">
  import { pb } from '$lib/pb';
  import { getAuthContext } from '$lib/stores/auth.svelte';

  const auth = getAuthContext();

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let success = $state(false);
  let error = $state('');

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

  let passwordStrength = $derived.by(() => {
    if (!newPassword) return '';
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    if (score <= 3) return 'good';
    return 'strong';
  });

  let passwordsMatch = $derived(confirmPassword === '' || newPassword === confirmPassword);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!passwordsMatch) return;
    if (!auth.user) return;
    error = '';
    loading = true;
    try {
      await pb.collection('users').update(auth.user.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: confirmPassword,
      });
      success = true;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to update password. Check your current password and try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Change Password — ElectraStore</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card reveal" style="--stagger-index: 0">
    <a href="/" class="auth-logo" aria-label="ElectraStore home">
      Electra<span class="auth-logo-accent">Store</span>
    </a>

    {#if !success}
      <h1 class="auth-title">Change password</h1>
      <p class="auth-subtitle">Update your password to keep your account secure.</p>

      {#if error}
        <div class="auth-error" role="alert">{error}</div>
      {/if}

      <form onsubmit={handleSubmit} class="auth-form">
        <div class="field-group">
          <label for="current-password" class="field-label">Current Password</label>
          <input id="current-password" type={showPassword ? 'text' : 'password'} bind:value={currentPassword} class="field-input" placeholder="Enter current password" autocomplete="current-password" required />
        </div>

        <div class="field-group">
          <label for="new-password" class="field-label">New Password</label>
          <input id="new-password" type={showPassword ? 'text' : 'password'} bind:value={newPassword} class="field-input" placeholder="Enter new password" autocomplete="new-password" required />
          {#if newPassword}
            <div class="password-strength">
              <div class="strength-bar"><div class="strength-fill strength-fill-{passwordStrength}"></div></div>
              <span class="strength-label strength-label-{passwordStrength}">
                {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'fair' ? 'Fair' : passwordStrength === 'good' ? 'Good' : 'Strong'}
              </span>
            </div>
          {/if}
        </div>

        <div class="field-group">
          <label for="confirm-password" class="field-label">Confirm New Password</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            bind:value={confirmPassword}
            class="field-input"
            class:field-input--error={!passwordsMatch && confirmPassword !== ''}
            placeholder="Confirm new password"
            autocomplete="new-password"
            required
          />
          {#if !passwordsMatch && confirmPassword !== ''}
            <span class="field-error">Passwords do not match</span>
          {/if}
        </div>

        <label class="checkbox-label">
          <input type="checkbox" class="checkbox-input" bind:checked={showPassword} />
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">Show passwords</span>
        </label>

        <button type="submit" class="btn-primary auth-submit" disabled={loading}>
          {#if loading}
            <span class="spinner"></span>
            Updating…
          {:else}
            Update Password
          {/if}
        </button>
      </form>
    {:else}
      <div class="success-state">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h1 class="auth-title">Password updated</h1>
        <p class="auth-subtitle">Your password has been changed successfully.</p>
        <a href="/" class="btn-primary auth-back-btn">Back to Home</a>
      </div>
    {/if}
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
  .auth-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .spinner { width: 1rem; height: 1rem; border: 2px solid var(--color-bg); border-top-color: transparent; border-radius: 50%; animation: spin 600ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .success-state { text-align: center; }
  .success-icon { display: inline-flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 50%; background-color: rgba(48, 209, 88, 0.15); color: var(--color-success); margin-top: 1rem; }
  .auth-back-btn { display: inline-block; margin-top: 1.5rem; text-align: center; }
  @media (prefers-reduced-motion: reduce) { .auth-logo { transition: none; } .auth-card { animation: none; opacity: 1; transform: none; } .spinner { animation-duration: 1000ms; } }
</style>