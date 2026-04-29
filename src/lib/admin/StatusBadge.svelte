<script lang="ts">
  let { status, size = 'md' }: {
    status: string;
    size?: 'sm' | 'md';
  } = $props();

  const colorMap: Record<string, string> = {
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    paid: 'bg-green-500/15 text-green-400 border-green-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    true: 'bg-green-500/15 text-green-400 border-green-500/30',
    false: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    customer: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const displayLabels: Record<string, string> = {
    true: 'Yes',
    false: 'No',
  };
</script>

<span
  class="inline-flex items-center border rounded-full {size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'} font-medium {colorMap[String(status)] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'}"
>
  {displayLabels[String(status)] ?? String(status).charAt(0).toUpperCase() + String(status).slice(1)}
</span>
