<script lang="ts">
  let { data, form } = $props();

  let showDeleteConfirm = $state(false);

  const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatDateTime = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function statusClass(s: string) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
      paid: 'bg-green-500/15 text-green-400 border-green-500/30',
      failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    };
    return map[s] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/users" class="text-[#86868b] hover:text-[#f5f5f7] transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">User Detail</h1>
  </div>

  {#if form?.error}
    <div class="mb-6 px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm">
      {form.error}
    </div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-5">
      <div class="flex items-center gap-4 mb-6">
        {#if data.user.avatarUrl}
          <div class="w-16 h-16 rounded-full overflow-hidden bg-[#2d2d2f] border border-[#424245]">
            <img src={data.user.avatarUrl} alt="" class="w-full h-full object-cover" />
          </div>
        {:else}
          <div class="w-16 h-16 rounded-full bg-[#2997ff]/15 border border-[#2997ff]/30 flex items-center justify-center text-[#2997ff] text-xl font-semibold">
            {(data.user.name || 'U')[0].toUpperCase()}
          </div>
        {/if}
        <div>
          <h2 class="text-lg font-semibold text-[#f5f5f7]">{data.user.name}</h2>
          <p class="text-sm text-[#86868b] font-mono">{data.user.email}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between py-2 border-b border-[#424245]/50">
          <span class="text-sm text-[#86868b]">Role</span>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {data.user.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}">
              {data.user.role}
            </span>
            <form method="post" action="?/toggleRole" class="inline">
              <input type="hidden" name="role" value={data.user.role} />
              <button type="submit" class="text-xs text-[#2997ff] hover:underline">
                {data.user.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
              </button>
            </form>
          </div>
        </div>

        <div class="flex items-center justify-between py-2 border-b border-[#424245]/50">
          <span class="text-sm text-[#86868b]">Verified</span>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {data.user.verified ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}">
              {data.user.verified ? 'Yes' : 'No'}
            </span>
            <form method="post" action="?/toggleVerified" class="inline">
              <input type="hidden" name="verified" value={String(data.user.verified)} />
              <button type="submit" class="text-xs text-[#2997ff] hover:underline">
                {data.user.verified ? 'Unverify' : 'Verify'}
              </button>
            </form>
          </div>
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-sm text-[#86868b]">Joined</span>
          <span class="text-sm text-[#f5f5f7]">{formatDate(data.user.created)}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-[#424245]/50">
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56] transition-colors"
          onclick={() => (showDeleteConfirm = true)}
        >
          Delete User
        </button>
      </div>
    </div>

    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-5">
      <h2 class="text-sm font-semibold text-[#f5f5f7] uppercase tracking-wider mb-4">Orders ({data.totalOrders})</h2>

      {#if data.orders.length === 0}
        <p class="text-sm text-[#86868b] text-center py-8">No orders from this user.</p>
      {:else}
        <div class="space-y-2">
          {#each data.orders as order}
            <div class="flex items-center justify-between py-2.5 border-b border-[#424245]/50 last:border-0">
              <div>
                <a href="/admin/orders/{order.id}" class="text-[#2997ff] hover:underline font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </a>
                <span class="text-xs text-[#86868b] ml-2">{formatDateTime(order.created)}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-[#f5f5f7] font-medium">${order.total.toLocaleString()}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {statusClass(order.status)}">{order.status}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showDeleteConfirm}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={() => (showDeleteConfirm = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-[#1d1d1f] border border-[#424245] rounded-[18px] p-6 w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h3 class="text-lg font-semibold text-[#f5f5f7] mb-2">Delete User</h3>
      <p class="text-[#86868b] text-sm mb-6">
        Are you sure you want to delete <span class="text-[#f5f5f7]">{data.user.name}</span>? This cannot be undone.
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f] transition-colors"
          onclick={() => (showDeleteConfirm = false)}
        >
          Cancel
        </button>
        <form method="post" action="?/delete">
          <input type="hidden" name="role" value={data.user.role} />
          <button
            type="submit"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56] transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
