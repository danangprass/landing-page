<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let { data, form } = $props();

  let deleteId = $state('');
  let deleteRole = $state('');
  let deleteName = $state('');
  let showConfirm = $state(false);

  const formatDate = (d: string) => d === '-' ? '-' : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-[#f5f5f7]">Users</h1>
    <form class="flex items-center gap-2" method="get">
      <Input
        type="text" name="search"
        value={data.search}
        placeholder="Search users..."
        class="px-4 py-2 rounded-xl bg-[#1d1d1f] border border-[#424245] text-sm text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#2997ff]"
      />
      <Button type="submit" class="px-4 py-2 rounded-xl bg-[#2997ff] text-white text-sm font-medium hover:bg-[#0a84ff]">
        Search
      </Button>
      {#if data.search}
        <Button variant="outline" href="/admin/users" class="px-4 py-2 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#2d2d2f]">
          Clear
        </Button>
      {/if}
    </form>
  </div>

  {#if form?.error}
    <div class="mb-6 px-4 py-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-sm">
      {form.error}
    </div>
  {/if}

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
              <th class="px-4 py-3 text-right text-xs font-medium text-[#86868b] uppercase">Actions</th>
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
                  <Badge variant="outline" class={user.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}>
                    {user.role}
                  </Badge>
                </td>
                <td class="px-4 py-3 text-center">
                  <Badge variant="outline" class={user.verified ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'}>
                    {user.verified ? 'Yes' : 'No'}
                  </Badge>
                </td>
                <td class="px-4 py-3 text-[#86868b] whitespace-nowrap">{formatDate(user.created)}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/admin/users/{user.id}" class="text-[#2997ff] text-xs hover:underline">View</a>
                    <Button
                      variant="link"
                      class="text-[#ff453a] text-xs hover:underline"
                      onclick={() => { deleteId = user.id; deleteRole = String(user.role || ''); deleteName = String(user.name || ''); showConfirm = true; }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
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

{#if showConfirm}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={() => (showConfirm = false)}
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
        Are you sure you want to delete <span class="text-[#f5f5f7]">{deleteName}</span>? This cannot be undone.
      </p>
      <div class="flex justify-end gap-3">
        <Button
          variant="outline"
          class="px-4 py-2 rounded-xl text-sm font-medium text-[#f5f5f7] bg-[#2d2d2f] hover:bg-[#3d3d3f] transition-colors"
          onclick={() => (showConfirm = false)}
        >
          Cancel
        </Button>
        <form method="post" action="?/delete">
          <input type="hidden" name="id" value={deleteId} />
          <input type="hidden" name="role" value={deleteRole} />
          <Button
            type="submit"
            variant="destructive"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#ff453a] hover:bg-[#ff5f56] transition-colors"
          >
            Delete
          </Button>
        </form>
      </div>
    </div>
  </div>
{/if}
