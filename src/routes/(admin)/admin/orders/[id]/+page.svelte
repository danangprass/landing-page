<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem } from '$lib/components/ui/select/index.js';

  let { data } = $props();

  let newStatus = $state('');

  const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
    <a href="/admin/orders" class="text-muted-foreground hover:text-foreground">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-foreground">Order <span class="font-mono text-muted-foreground text-sm">{data.order.id.slice(0, 12)}...</span></h1>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Order Info -->
    <div class="bg-background border border-border rounded-xl p-5 space-y-4">
      <h2 class="text-sm font-semibold text-foreground uppercase tracking-wider">Order Information</h2>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Customer</span>
          <p class="text-foreground font-medium">{data.order.userName}</p>
          <p class="text-muted-foreground text-xs">{data.order.userEmail}</p>
        </div>
        <div>
          <span class="text-muted-foreground">Total</span>
          <p class="text-foreground font-medium text-lg">${data.order.total.toLocaleString()}</p>
        </div>
        <div>
          <span class="text-muted-foreground">Placed</span>
          <p class="text-foreground">{formatDate(data.order.created)}</p>
        </div>
      </div>

      <div>
        <span class="text-sm text-muted-foreground">Shipping Address</span>
        <p class="text-foreground text-sm mt-0.5 whitespace-pre-line">{data.order.shipping_address}</p>
      </div>
      <div>
        <span class="text-sm text-muted-foreground">Billing Address</span>
        <p class="text-foreground text-sm mt-0.5 whitespace-pre-line">{data.order.billing_address}</p>
      </div>
    </div>

    <!-- Status Update -->
    <div class="space-y-6">
      <div class="bg-background border border-border rounded-xl p-5 space-y-4">
        <h2 class="text-sm font-semibold text-foreground uppercase tracking-wider">Current Status</h2>
        <div class="flex items-center gap-4">
          <div class="text-center">
            <span class="text-xs text-muted-foreground block mb-1">Fulfillment</span>
            <Badge variant="outline" class={statusClass(data.order.status)}>{data.order.status}</Badge>
          </div>
        </div>

        <form method="post" action="?/updateStatus" class="space-y-3">
          <div>
            <Label class="text-xs text-muted-foreground block mb-1">Update Status</Label>
            <input type="hidden" name="status" value={newStatus} />
            <Select type="single" bind:value={newStatus}>
              <SelectTrigger class="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary w-full">
                {newStatus ? newStatus.charAt(0).toUpperCase() + newStatus.slice(1) : 'No change'}
              </SelectTrigger>
              <SelectContent class="bg-background border border-border rounded-xl text-sm text-foreground">
                <SelectGroup>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" class="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Update Status
          </Button>
        </form>
      </div>

      <!-- Order Items -->
      <div class="bg-background border border-border rounded-xl p-5">
        <h2 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Items ({data.items.length})</h2>
        <div class="space-y-2">
          {#each data.items as item}
            <div class="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <div>
                <span class="text-foreground">{item.productName}</span>
                <span class="text-muted-foreground ml-2">x{item.quantity}</span>
              </div>
              <span class="text-foreground font-medium">${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
