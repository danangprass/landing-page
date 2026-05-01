<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import TableHeader from '$lib/components/ui/table/table-header.svelte';
  import TableRow from '$lib/components/ui/table/table-row.svelte';
  import TableHead from '$lib/components/ui/table/table-head.svelte';
  import TableBody from '$lib/components/ui/table/table-body.svelte';
  import TableCell from '$lib/components/ui/table/table-cell.svelte';
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
      month: 'long',
      day: 'numeric',
    });
  }
</script>

<svelte:head>
  <title>Order #{data.order.id.slice(-7)} — ElectraStore</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-12 md:px-12 lg:px-20">
  <div class="py-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>#{data.order.id.slice(-7)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="py-8 border-b border-border">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
          Order #{data.order.id.slice(-7)}
        </h1>
        <p class="mt-1 text-text-secondary">{formatDate(String(data.order.created))}</p>
      </div>
      <Badge variant={statusVariant(String(data.order.status ?? ''))} class="capitalize text-sm">{String(data.order.status ?? '')}</Badge>
    </div>
  </div>

  <div class="py-8">
    <h2 class="text-xl font-semibold text-text-primary mb-4">Items</h2>

    <Table.Root>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead class="text-right">Price</TableHead>
          <TableHead class="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each data.lineItems as item (item.id)}
          <TableRow>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-sm bg-bg flex items-center justify-center overflow-hidden shrink-0">
                  {#if item.image}
                    <img src={item.image} alt={item.name} class="w-full h-full object-cover" loading="lazy" />
                  {:else}
                    <span class="text-lg">📦</span>
                  {/if}
                </div>
                {#if item.slug}
                  <a href="/products/{item.slug}" class="text-text-primary hover:text-accent transition-colors">{item.name}</a>
                {:else}
                  <span>{item.name}</span>
                {/if}
              </div>
            </TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell class="text-right">{formatPrice(item.price)}</TableCell>
            <TableCell class="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table.Root>
  </div>

  <Card.Root>
    <Card.Content class="space-y-3">
      <div class="flex justify-between">
        <span class="text-text-secondary">Subtotal</span>
        <span class="text-text-primary font-medium">
          {formatPrice(data.lineItems.reduce((sum: number, i: {price: number; quantity: number}) => sum + i.price * i.quantity, 0))}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-text-secondary">Tax</span>
        <span class="text-text-primary font-medium">
          {formatPrice(data.lineItems.reduce((sum: number, i: {price: number; quantity: number}) => sum + i.price * i.quantity, 0) * 0.1)}
        </span>
      </div>
      <div class="flex justify-between pt-3 border-t border-border">
        <span class="text-text-primary font-semibold">Total</span>
        <span class="text-xl font-bold text-text-primary">{formatPrice(Number(data.order.total))}</span>
      </div>
    </Card.Content>
  </Card.Root>

  <div class="mt-8">
    <a href="/orders" class="text-sm text-accent hover:underline">← Back to Orders</a>
  </div>
</div>
