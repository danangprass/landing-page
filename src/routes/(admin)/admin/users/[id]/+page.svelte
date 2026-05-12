<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let { data, form } = $props();

  let showDeleteConfirm = $state(false);

  const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatDateTime = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function statusClass(s: string) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      paid: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[s] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  }
</script>

<div>
  <div class="flex items-center gap-3 mb-6">
    <a href="/admin/users" class="text-muted-foreground hover:text-foreground transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-foreground">User Detail</h1>
  </div>

  {#if form?.error}
    <div class="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      {form.error}
    </div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="bg-background border border-border rounded-xl p-5">
      <div class="flex items-center gap-4 mb-6">
        {#if data.user.avatarUrl}
          <div class="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border">
            <img src={data.user.avatarUrl} alt="" class="w-full h-full object-cover" />
          </div>
        {:else}
          <div class="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-xl font-semibold">
            {(data.user.name || 'U')[0].toUpperCase()}
          </div>
        {/if}
        <div>
          <h2 class="text-lg font-semibold text-foreground">{data.user.name}</h2>
          <p class="text-sm text-muted-foreground font-mono">{data.user.email}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between py-2 border-b border-border/50">
          <span class="text-sm text-muted-foreground">Role</span>
          <div class="flex items-center gap-3">
            <Badge variant="outline" class={data.user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
              {data.user.role}
            </Badge>
            <form method="post" action="?/toggleRole" class="inline">
              <input type="hidden" name="role" value={data.user.role} />
              <Button type="submit" variant="link" class="text-xs text-primary hover:underline">
                {data.user.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
              </Button>
            </form>
          </div>
        </div>

        <div class="flex items-center justify-between py-2 border-b border-border/50">
          <span class="text-sm text-muted-foreground">Verified</span>
          <div class="flex items-center gap-3">
            <Badge variant="outline" class={data.user.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}>
              {data.user.verified ? 'Yes' : 'No'}
            </Badge>
            <form method="post" action="?/toggleVerified" class="inline">
              <input type="hidden" name="verified" value={String(data.user.verified)} />
              <Button type="submit" variant="link" class="text-xs text-primary hover:underline">
                {data.user.verified ? 'Unverify' : 'Verify'}
              </Button>
            </form>
          </div>
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-sm text-muted-foreground">Joined</span>
          <span class="text-sm text-foreground">{formatDate(data.user.created)}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-border/50">
        <Button
          variant="destructive"
          class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
          onclick={() => (showDeleteConfirm = true)}
        >
          Delete User
        </Button>
      </div>
    </div>

    <div class="bg-background border border-border rounded-xl p-5">
      <h2 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Orders ({data.totalOrders})</h2>

      {#if data.orders.length === 0}
        <p class="text-sm text-muted-foreground text-center py-8">No orders from this user.</p>
      {:else}
        <div class="space-y-2">
          {#each data.orders as order}
            <div class="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <div>
                <a href="/admin/orders/{order.id}" class="text-primary hover:underline font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </a>
                <span class="text-xs text-muted-foreground ml-2">{formatDateTime(order.created)}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-foreground font-medium">${order.total.toLocaleString()}</span>
                <Badge variant="outline" class={statusClass(order.status)}>{order.status}</Badge>
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
      class="bg-background border border-border rounded-[18px] p-6 w-full max-w-md mx-4 shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h3 class="text-lg font-semibold text-foreground mb-2">Delete User</h3>
      <p class="text-muted-foreground text-sm mb-6">
        Are you sure you want to delete <span class="text-foreground">{data.user.name}</span>? This cannot be undone.
      </p>
      <div class="flex justify-end gap-3">
        <Button
          variant="outline"
          class="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
          onclick={() => (showDeleteConfirm = false)}
        >
          Cancel
        </Button>
        <form method="post" action="?/delete">
          <input type="hidden" name="role" value={data.user.role} />
          <Button
            type="submit"
            variant="destructive"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
          >
            Delete
          </Button>
        </form>
      </div>
    </div>
  </div>
{/if}
