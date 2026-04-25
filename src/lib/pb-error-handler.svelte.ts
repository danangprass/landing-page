import { ClientResponseError } from 'pocketbase';
import { pb } from './pb';

export type ToastType = 'success' | 'error' | 'info';

export interface ParsedError {
  message: string;
  type: ToastType;
  status?: number;
  data?: Record<string, unknown>;
}

const ERROR_MAP: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You need to sign in to continue.',
  403: 'You don\'t have permission to do this.',
  404: 'The requested item was not found.',
  409: 'This item already exists.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
};

interface SafeCallOptions {
  silent?: boolean;
}

interface ClientErrorData {
  data?: Record<string, { message?: string }>;
}

/**
 * Parse a PocketBase or generic error into a user-friendly message.
 */
export function parseError(err: unknown): ParsedError {
  if (err instanceof ClientResponseError) {
    const status = err.status ?? 0;
    // Prefer the actual PocketBase error message, fall back to generic map
    const baseMessage = err.message?.trim() || ERROR_MAP[status] || 'An unexpected error occurred.';

    // Extract field-level validation errors
    const data = (err.data as ClientErrorData | undefined)?.data;
    if (data) {
      const fieldErrors = Object.entries(data)
        .map(([field, value]) => {
          const msg = value?.message;
          return msg ? `${field}: ${msg}` : '';
        })
        .filter(Boolean)
        .join(', ');
      if (fieldErrors) {
        return { message: `${baseMessage} ${fieldErrors}`, type: 'error', status, data: err.data as Record<string, unknown> };
      }
    }

    return { message: baseMessage, type: 'error', status, data: err.data as Record<string, unknown> };
  }

  if (err instanceof Error) {
    if (err.message === 'NetworkError' || err.message.includes('Failed to fetch')) {
      return { message: 'Unable to connect. Please check your internet connection.', type: 'error' };
    }
    return { message: err.message, type: 'error' };
  }

  return { message: 'An unexpected error occurred.', type: 'error' };
}

/**
 * Toast notification store — components subscribe to show notifications.
 */
interface ToastEntry {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

let toasts = $state<ToastEntry[]>([]);
let nextId = 0;

export function getToasts(): ToastEntry[] {
  return toasts;
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type, duration }];
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
  }, duration + 300);
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
}

/**
 * Wrap a PB operation with centralized error handling.
 * Returns [data, null] on success, [null, ParsedError] on failure.
 */
export async function safeCall<T>(fn: () => Promise<T>, opts?: SafeCallOptions): Promise<[T, null] | [null, ParsedError]> {
  try {
    const data = await fn();
    return [data, null];
  } catch (err) {
    const parsed = parseError(err);
    console.error('[PB]', parsed.status, parsed.message, err);
    if (!opts?.silent) {
      showToast(parsed.message, parsed.type);
    }
    return [null, parsed];
  }
}

/**
 * Check if the current auth token is still valid.
 * Attempts a token refresh if expired.
 */
export async function ensureAuth(): Promise<boolean> {
  if (pb.authStore.isValid) return true;
  try {
    await pb.collection('users').authRefresh();
    return true;
  } catch {
    pb.authStore.clear();
    return false;
  }
}