<script lang="ts">
  let { data } = $props();

  const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatPrice = (c: number) => '$' + c.toLocaleString('en-US');

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
  <h1 class="text-2xl font-semibold text-[#f5f5f7] mb-6">Orders</h1>

  <!-- Filter tabs -->
  <div class="flex flex-wrap gap-2 mb-6">
    {#each statuses as s}
      <a
        href="/admin/orders{s ? '?status=' + s : ''}"
        class="px-4 py-2 rounded-xl text-sm font-medium border transition-colors {data.currentStatus === s ? 'bg-[#2997ff] border-[#2997ff] text-white' : 'bg-[#1d1d1f] border-[#424245] text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]'}"
      >
        {s || 'All'}
      </a>
    {/each}
  </div>

  {#if data.orders.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">No orders found.</p>
    </div>
  {:else}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#424245] bg-[#000]/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Order ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Customer</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Total</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Fulfillment</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Payment</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each data.orders as order}
              <tr class="border-b border-[#424245]/50 hover:bg-[#2d2d2f] transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/orders/{order.id}" class="text-[#2997ff] hover:underline font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </a>
                </td>
                <td class="px-4 py-3 text-[#f5f5f7]">{order.userName}</td>
                <td class="px-4 py-3 text-right text-[#f5f5f7] font-medium">{formatPrice(order.total)}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {statusClass(order.status)}">{order.status}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {statusClass(order.order_status)}">{order.order_status}</span>
                </td>
                <td class="px-4 py-3 text-[#86868b] whitespace-nowrap">{formatDate(order.created)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    {#if data.totalPages > 1}
      <div class="flex items-center justify-center gap-2 mt-6">
        {#each Array(data.totalPages) as _, i}
          <a
            href="/admin/orders?page={i + 1}{data.currentStatus ? '&status=' + data.currentStatus : ''}"
            class="min-w-[36px] h-9 rounded-lg text-sm font-medium flex items-center justify-center {data.page === i + 1 ? 'bg-[#2997ff] text-white' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
          >
            {i + 1}
          </a>
        {/each}
      </div>
    {/if}
  {/if}
</div>
