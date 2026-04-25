<script lang="ts">
  let {
    value,
    min = 1,
    max = 99,
    onChange
  }: { value: number; min?: number; max?: number; onChange: (v: number) => void } = $props();

  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < max) onChange(value + 1);
  }
</script>

<div class="stepper">
  <button
    class="stepper-btn"
    onclick={decrement}
    disabled={value <= min}
    aria-label="Decrease quantity"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14" /></svg>
  </button>
  <span class="stepper-value">{value}</span>
  <button
    class="stepper-btn"
    onclick={increment}
    disabled={value >= max}
    aria-label="Increase quantity"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
  </button>
</div>

<style>
  .stepper {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: border-color 160ms var(--ease-out);
  }

  .stepper:focus-within {
    border-color: var(--color-accent);
  }

  .stepper-btn {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--color-text-primary);
    cursor: pointer;
    transition:
      transform 160ms var(--ease-out),
      background-color 200ms var(--ease-out);
  }

  .stepper-btn:active {
    transform: scale(0.97);
  }

  .stepper-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (hover: hover) and (pointer: fine) {
    .stepper-btn:not(:disabled):hover {
      background-color: var(--color-surface-hover);
    }
  }

  .stepper-value {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }
</style>