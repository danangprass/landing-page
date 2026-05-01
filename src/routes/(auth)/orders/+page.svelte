<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Breadcrumb from '$lib/components/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/components/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/components/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/components/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/components/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/components/ui/breadcrumb/breadcrumb-separator.svelte';

  let { data } = $props();

  function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: 'secondary',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
      failed: 'destructive',
    };
    return map[status] ?? 'outline';
  }

  function formatPrice(dollars: number): string {
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  function formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<svelte:head>
  <title>Orders — ElectraStore</title>
</svelte:head>

<div class="section-padding">
  <div class="py-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Orders</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="py-8 border-b border-border">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight">
      Order History
    </h1>
  </div>

  {#if data.orders.length === 0}
    <div class="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <svg class="w-16 h-16 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
      <p class="text-xl font-medium text-text-primary">No orders yet.</p>
      <p class="text-text-secondary">Your past purchases will appear here.</p>
      <Button href="/products" class="mt-2">Browse Products</Button>
    </div>
  {:else}
    <div class="py-8 space-y-4">
      {#each data.orders as order (order.id)}
        <a href="/orders/{order.id}" class="block">
          <Card.Root class="hover:border-accent transition-colors">
            <Card.Header class="flex-row items-center justify-between bg-bg/50">
              <div>
                <span class="text-xs text-text-secondary uppercase tracking-wide">Order</span>
                <span class="text-sm font-semibold text-text-primary ml-2">#{order.id.slice(-7)}</span>
              </div>
              <Badge variant={statusVariant(order.status)} class="capitalize">{order.status}</Badge>
            </Card.Header>
            <Card.Content>
              <div class="flex flex-col gap-2.5">
                {#each order.previewItems as item}
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-sm bg-bg flex items-center justify-center overflow-hidden shrink-0">
                      {#if item.image}
                        <img src={item.image} alt={item.name} class="w-full h-full object-cover" loading="lazy" />
                      {:else}
                        <span class="text-lg">📦</span>
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="text-sm text-text-primary block truncate">{item.name}</span>
                      <span class="text-xs text-text-secondary">Qty: {item.quantity}</span>
                    </div>
                    <span class="text-sm font-medium text-text-primary shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                {/each}
                {#if order.itemCount > 3}
                  <p class="text-xs text-text-secondary ml-4 mt-1">+{order.itemCount - 3} more items</p>
                {/if}
              </div>

              <div class="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span class="text-sm text-text-secondary">{formatDate(String(order.created))}</span>
                <span class="text-lg font-semibold text-text-primary">{formatPrice(order.total)}</span>
              </div>
            </Card.Content>
          </Card.Root>
        </a>
      {/each}
    </div>
  {/if}
</div>
