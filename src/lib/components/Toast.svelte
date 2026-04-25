<script lang="ts">
  let {
    message,
    type = 'success',
    duration = 3000,
    onDismiss
  }: {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onDismiss: () => void;
  } = $props();

  let visible = $state(false);

  $effect(() => {
    requestAnimationFrame(() => {
      visible = true;
    });

    const timer = setTimeout(() => {
      visible = false;
      const exitTimer = setTimeout(() => onDismiss(), 300);
      return () => clearTimeout(exitTimer);
    }, duration);

    return () => clearTimeout(timer);
  });
</script>

<div
  class="toast toast--{type} {visible ? 'toast--visible' : ''}"
  role="alert"
>
  <p class="toast-message">{message}</p>
</div>

<style>
  .toast {
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    border: 1px solid;
    backdrop-filter: blur(24px);
    opacity: 0;
    transform: translateY(0.5rem);
    transition:
      opacity 300ms var(--ease-out),
      transform 300ms var(--ease-out);
    white-space: nowrap;
  }

  .toast--visible {
    opacity: 1;
    transform: translateY(0);
    transition-duration: 400ms;
  }

  .toast--success {
    background-color: rgba(48, 209, 88, 0.15);
    border-color: rgba(48, 209, 88, 0.4);
    color: var(--color-success);
  }

  .toast--error {
    background-color: rgba(255, 69, 58, 0.15);
    border-color: rgba(255, 69, 58, 0.4);
    color: var(--color-error);
  }

  .toast--info {
    background-color: rgba(41, 151, 255, 0.15);
    border-color: rgba(41, 151, 255, 0.4);
    color: var(--color-accent);
  }

  .toast-message {
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>