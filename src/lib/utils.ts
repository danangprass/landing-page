import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export { type WithElementRef, type WithoutChildrenOrChild, type WithoutChild } from 'bits-ui';
