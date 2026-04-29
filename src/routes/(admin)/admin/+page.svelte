<script lang="ts">
  let { data } = $props();

  const kpis = [
    { label: 'Total Revenue', value: '$' + data.kpis.totalRevenue.toLocaleString('en-US'), color: 'text-[#30d158]' },
    { label: 'Monthly Revenue', value: '$' + data.kpis.monthlyRevenue.toLocaleString('en-US'), color: 'text-[#30d158]' },
    { label: 'Total Orders', value: data.kpis.totalOrders.toLocaleString(), color: 'text-[#2997ff]' },
    { label: 'Pending Orders', value: data.kpis.pendingOrders.toLocaleString(), color: data.kpis.pendingOrders > 0 ? 'text-[#ff9f0a]' : 'text-[#86868b]' },
    { label: 'Total Products', value: data.kpis.totalProducts.toLocaleString(), color: 'text-[#f5f5f7]' },
    { label: 'Total Users', value: data.kpis.totalUsers.toLocaleString(), color: 'text-[#f5f5f7]' },
    { label: 'Low Stock', value: data.kpis.lowStock.toLocaleString(), color: data.kpis.lowStock > 0 ? 'text-[#ff453a]' : 'text-[#86868b]' },
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div>
  <h1 class="text-2xl font-semibold text-[#f5f5f7] mb-6">Dashboard</h1>

  <!-- KPI Grid -->
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
    {#each kpis as kpi}
      <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl p-4">
        <p class="text-xs text-[#86868b] uppercase tracking-wider mb-1">{kpi.label}</p>
        <p class="text-xl font-semibold {kpi.color}">{kpi.value}</p>
      </div>
    {/each}
  </div>

  <!-- Recent Orders -->
  <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl overflow-hidden">
    <div class="px-5 py-4 border-b border-[#424245]">
      <h2 class="text-sm font-semibold text-[#f5f5f7]">Recent Orders</h2>
    </div>

    {#if data.recentOrders.length === 0}
      <p class="px-5 py-8 text-sm text-[#86868b] text-center">No orders yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#424245] bg-[#000]/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Order</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Customer</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Total</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each data.recentOrders as order}
              <tr class="border-b border-[#424245]/50 hover:bg-[#2d2d2f] transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/orders/{order.id}" class="text-[#2997ff] hover:underline font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </a>
                </td>
                <td class="px-4 py-3 text-[#f5f5f7]">{order.userName}</td>
                <td class="px-4 py-3 text-[#f5f5f7]">${order.total.toLocaleString()}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                    {order.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                     order.status === 'processing' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                     order.status === 'shipped' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                     order.status === 'delivered' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                     'bg-red-500/15 text-red-400 border-red-500/30'}">
                    {order.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-[#86868b] whitespace-nowrap">{formatDate(order.created)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
