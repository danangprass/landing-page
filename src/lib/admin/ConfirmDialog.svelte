<script lang="ts">
  let { open = false, title = 'Confirm', message = '', confirmLabel = 'Confirm', danger = false, onConfirm = () => {}, onCancel = () => {} }: {
    open?: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={onCancel}
    onkeydown={handleKeydown}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onclick={(e: MouseEvent) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">{title}</h3>
      <p class="text-[#86868b] text-sm leading-relaxed mb-6">{message}</p>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f] transition-colors"
          onclick={onCancel}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors {danger ? 'bg-[#ff453a] hover:bg-[#ff5f56]' : 'bg-[#2997ff] hover:bg-[#0a84ff]'}"
          onclick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}
