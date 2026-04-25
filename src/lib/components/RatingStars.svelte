<script lang="ts">
  let { rating, count }: { rating: number; count: number } = $props();

  function starType(index: number): 'full' | 'half' | 'empty' {
    if (rating >= index + 1) return 'full';
    if (rating >= index + 0.5) return 'half';
    return 'empty';
  }
</script>

<div class="rating-stars">
  <div class="stars">
    {#each Array(5) as _, i}
      {@const type = starType(i)}
      {#if type === 'full'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="star star--full"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.28.709 2.145l-4.118 3.718.934 5.387c.18 1.045-.836 1.879-1.696 1.317L12 18.347l-5.025 2.67c-.86.462-1.876-.272-1.696-1.317l.934-5.387-4.118-3.718c-.927-.865-.455-2.052.709-2.145l5.404-.433 2.082-5.007z" />
        </svg>
      {:else if type === 'half'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="star star--half"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <defs>
            <linearGradient id="half-star-{i}">
              <stop offset="50%" stop-color="currentColor" />
              <stop offset="50%" stop-color="#424245" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-star-{i})"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.28.709 2.145l-4.118 3.718.934 5.387c.18 1.045-.836 1.879-1.696 1.317L12 18.347l-5.025 2.67c-.86.462-1.876-.272-1.696-1.317l.934-5.387-4.118-3.718c-.927-.865-.455-2.052.709-2.145l5.404-.433 2.082-5.007z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="star star--empty"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.28.709 2.145l-4.118 3.718.934 5.387c.18 1.045-.836 1.879-1.696 1.317L12 18.347l-5.025 2.67c-.86.462-1.876-.272-1.696-1.317l.934-5.387-4.118-3.718c-.927-.865-.455-2.052.709-2.145l5.404-.433 2.082-5.007z" />
        </svg>
      {/if}
    {/each}
  </div>
  <span class="rating-value">{rating}</span>
  <span class="rating-count">({count})</span>
</div>

<style>
  .rating-stars {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .stars {
    display: flex;
    gap: 0.125rem;
  }

  .star {
    width: 1rem;
    height: 1rem;
    transition: fill 200ms var(--ease-out);
  }

  .star--full {
    color: var(--color-warning);
  }

  .star--half {
    color: var(--color-warning);
  }

  .star--empty {
    color: var(--color-border);
  }

  .rating-value {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .rating-count {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
</style>