<script lang="ts">
  let {
    price,
    originalPrice,
    discount
  }: { price: number; originalPrice?: number; discount?: number } = $props();
</script>

<div class="price-display">
  <span class="price-current">${price}</span>
  {#if originalPrice}
    <span class="price-original">${originalPrice}</span>
  {/if}
  {#if discount}
    <span class="price-badge">-{discount}%</span>
  {/if}
</div>

<style>
  .price-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .price-current {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .price-original {
    font-size: 1.125rem;
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  .price-badge {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
    background-color: rgba(255, 159, 10, 0.2);
    color: var(--color-warning);
  }
</style>