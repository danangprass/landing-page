import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/render-helpers.js';

export function formatCurrency(cents: number): string {
	return '$' + cents.toLocaleString('en-US');
}

export function formatDate(d: string): string {
	if (!d || d === '-') return '-';
	return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function truncateId(id: string): string {
	return id.slice(0, 8) + '...';
}

export function statusBadgeClass(s: string): string {
	const map: Record<string, string> = {
		pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
		processing: 'bg-blue-50 text-blue-700 border-blue-200',
		shipped: 'bg-purple-50 text-purple-700 border-purple-200',
		delivered: 'bg-green-50 text-green-700 border-green-200',
		cancelled: 'bg-red-50 text-red-700 border-red-200',
		paid: 'bg-green-50 text-green-700 border-green-200',
		failed: 'bg-red-50 text-red-700 border-red-200',
		settlement: 'bg-green-50 text-green-700 border-green-200',
	};
	return map[s] ?? 'bg-gray-100 text-gray-500 border-gray-200';
}

export function booleanBadgeClass(v: boolean): string {
	return v
		? 'bg-green-50 text-green-700 border-green-200'
		: 'bg-gray-100 text-gray-500 border-gray-200';
}

export { renderComponent, renderSnippet };
export type { ColumnDef };
