<script lang="ts">
  let { data } = $props();

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Users</h1>
    <form class="flex items-center gap-2" method="get">
      <input
        type="text" name="search"
        value={data.search}
        placeholder="Search users..."
        class="px-4 py-2 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
      />
      <button type="submit" class="px-4 py-2 rounded-xl bg-[#2997ff] text-white text-sm font-medium hover:bg-[#0a84ff]">
        Search
      </button>
      {#if data.search}
        <a href="/admin/users" class="px-4 py-2 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]">
          Clear
        </a>
      {/if}
    </form>
  </div>

  {#if data.users.length === 0}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl px-5 py-12 text-center">
      <p class="text-[#86868b] text-sm">{data.search ? 'No users matching "' + data.search + '"' : 'No users found.'}</p>
    </div>
  {:else}
    <div class="bg-[#1d1d1f] border border-[#424245] rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#424245] bg-[#000]/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Email</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Role</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-[#86868b] uppercase">Verified</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#86868b] uppercase">Joined</th>
            </tr>
          </thead>
          <tbody>
            {#each data.users as user}
              <tr class="border-b border-[#424245]/50 hover:bg-[#2d2d2f] transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/users/{user.id}" class="text-[#f5f5f7] font-medium hover:text-[#2997ff] transition-colors">{user.name}</a>
                </td>
                <td class="px-4 py-3 text-[#86868b] font-mono text-xs">{user.email}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {user.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}">
                    {user.role}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {user.verified ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}">
                    {user.verified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td class="px-4 py-3 text-[#86868b] whitespace-nowrap">{formatDate(user.created)}</td>
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
            href="/admin/users?page={i + 1}{data.search ? '&search=' + data.search : ''}"
            class="min-w-[36px] h-9 rounded-lg text-sm font-medium flex items-center justify-center {data.page === i + 1 ? 'bg-[#2997ff] text-white' : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]'}"
          >
            {i + 1}
          </a>
        {/each}
      </div>
    {/if}
  {/if}
</div>
