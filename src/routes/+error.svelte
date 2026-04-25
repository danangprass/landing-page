<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>Error {page.status} — ElectraStore</title>
</svelte:head>

<div class="error-page">
  <div class="error-card">
    <p class="error-code">{page.status}</p>
    <h1 class="error-title">Something went wrong</h1>
    <p class="error-subtitle">
      {#if page.status === 404}
        The page you're looking for doesn't exist.
      {:else if page.status === 403}
        You don't have permission to view this page.
      {:else}
        An unexpected error occurred. Please try again later.
      {/if}
    </p>
    <a href="/" class="btn-primary error-btn">Go Home</a>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background-color: #000;
  }
  .error-card {
    text-align: center;
    max-width: 480px;
  }
  .error-code {
    font-size: 6rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: rgba(245, 245, 247, 0.15);
    line-height: 1;
    margin: 0 0 1rem;
  }
  .error-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #f5f5f7;
    margin: 0 0 0.75rem;
  }
  .error-subtitle {
    font-size: 0.9375rem;
    color: rgba(245, 245, 247, 0.6);
    margin: 0 0 2rem;
    line-height: 1.6;
  }
  .error-btn {
    display: inline-block;
    text-align: center;
  }
</style>
