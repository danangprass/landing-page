<script lang="ts">
  let email = $state('');
  let loading = $state(false);
  let submitted = $state(false);
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

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    loading = true;
    await new Promise(r => setTimeout(r, 1500));
    loading = false;
    submitted = true;
  }
</script>

<svelte:head>
  <title>Reset Password — ElectraStore</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card reveal" style="--stagger-index: 0">
    <a href="/" class="auth-logo" aria-label="ElectraStore home">
      Electra<span class="auth-logo-accent">Store</span>
    </a>

    {#if !submitted}
      <h1 class="auth-title">Forgot password?</h1>
      <p class="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

      {#if error}
        <div class="auth-error" role="alert">{error}</div>
      {/if}

      <form onsubmit={handleSubmit} class="auth-form">
        <div class="field-group">
          <label for="email" class="field-label">Email</label>
          <input id="email" type="email" bind:value={email} class="field-input" placeholder="you@example.com" autocomplete="email" required />
        </div>

        <button type="submit" class="btn-primary auth-submit" disabled={loading}>
          {#if loading}
            <span class="spinner"></span>
            Sending…
          {:else}
            Send Reset Link
          {/if}
        </button>
      </form>

      <p class="auth-footer">
        Remember your password? <a href="/login" class="auth-link">Sign in</a>
      </p>
    {:else}
      <div class="success-state">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h1 class="auth-title">Check your email</h1>
        <p class="auth-subtitle">We sent a password reset link to <strong class="text-text-primary">{email}</strong></p>
        <p class="auth-subtitle" style="margin-top: 0.5rem;">Didn't receive the email? Check your spam folder or <button class="auth-link-inline" onclick={() => (submitted = false)}>try again</button>.</p>
        <a href="/login" class="btn-secondary auth-back-btn">Back to Sign In</a>
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
  .auth-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .spinner { width: 1rem; height: 1rem; border: 2px solid var(--color-bg); border-top-color: transparent; border-radius: 50%; animation: spin 600ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-link { color: var(--color-accent); text-decoration: none; transition: color 160ms var(--ease-out); }
  .auth-link:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .auth-link:hover { color: var(--color-accent-hover); } }
  .auth-footer { font-size: 0.875rem; color: var(--color-text-secondary); text-align: center; margin-top: 1.5rem; }

  /* Success state */
  .success-state { text-align: center; }
  .success-icon { display: inline-flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 50%; background-color: rgba(48, 209, 88, 0.15); color: var(--color-success); margin-top: 1rem; }
  .auth-link-inline { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: inherit; padding: 0; text-decoration: underline; transition: color 160ms var(--ease-out); }
  @media (hover: hover) and (pointer: fine) { .auth-link-inline:hover { color: var(--color-accent-hover); } }
  .auth-back-btn { display: inline-block; margin-top: 1.5rem; text-align: center; }

  @media (prefers-reduced-motion: reduce) { .auth-logo, .auth-link { transition: none; } .auth-card { animation: none; opacity: 1; transform: none; } .spinner { animation-duration: 1000ms; } }
</style>