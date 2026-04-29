<script lang="ts">
  let { label, required = false, error = '', children }: {
    label: string;
    required?: boolean;
    error?: string;
    children: import('svelte').Snippet;
  } = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label class="text-sm font-medium text-[#f5f5f7]">
    {label}
    {#if required}
      <span class="text-[#ff453a] ml-0.5">*</span>
    {/if}
  </label>
  {@render children()}
  {#if error}
    <p class="text-xs text-[#ff453a] mt-0.5">{error}</p>
  {/if}
</div>
