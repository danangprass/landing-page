<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import MinusIcon from '@lucide/svelte/icons/minus';
  import PlusIcon from '@lucide/svelte/icons/plus';

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

<div class="flex items-center border border-[#424245] rounded-lg overflow-hidden transition-colors focus-within:border-[#2997ff]">
  <Button
    variant="ghost"
    size="icon"
    class="w-10 h-10"
    onclick={decrement}
    disabled={value <= min}
    aria-label="Decrease quantity"
  >
    <MinusIcon class="size-4" />
  </Button>
  <span class="w-10 h-10 flex items-center justify-center font-medium tabular-nums text-[#f5f5f7]">{value}</span>
  <Button
    variant="ghost"
    size="icon"
    class="w-10 h-10"
    onclick={increment}
    disabled={value >= max}
    aria-label="Increase quantity"
  >
    <PlusIcon class="size-4" />
  </Button>
</div>
