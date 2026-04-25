import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const PB_URL = env.PUBLIC_PB_URL ?? 'http://localhost:8090';

/**
 * Cookie-based AuthStore adapter for PocketBase.
 * Stores auth token in cookies instead of localStorage for XSS protection.
 * Works with SvelteKit SSR — server reads cookies, client reads/writes them.
 */
class CookieAuthStore {
  private tokenKey = 'pb_auth';

  save(token: string, model: Record<string, unknown> | null) {
    if (!browser) return;
    document.cookie = `${this.tokenKey}=${encodeURIComponent(JSON.stringify({ token, model }))}; path=/; SameSite=Lax; max-age=604800`;
  }

  load(): { token: string; model: Record<string, unknown> | null } {
    if (!browser) return { token: '', model: null };
    const match = document.cookie.match(new RegExp(`(?:^|; )${this.tokenKey}=([^;]*)`));
    if (!match) return { token: '', model: null };
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return { token: '', model: null };
    }
  }

  clear() {
    if (!browser) return;
    document.cookie = `${this.tokenKey}=; path=/; SameSite=Lax; max-age=0`;
  }
}

const cookieStore = new CookieAuthStore();

export const pb = new PocketBase(PB_URL);

// Override auth store to use cookies
if (browser) {
  const saved = cookieStore.load();
  if (saved.token) {
    pb.authStore.save(saved.token, saved.model as unknown as Parameters<typeof pb.authStore.save>[1]);
  }

  pb.authStore.onChange((_token, model) => {
    if (_token) {
      cookieStore.save(_token, model as Record<string, unknown> | null);
    } else {
      cookieStore.clear();
    }
  });
}

export function getImageUrl(record: unknown, filename: string | undefined): string {
	if (!filename) return '';
	if (filename.startsWith('http') || filename.startsWith('/')) return filename;
	return pb.files.getUrl(record as Parameters<typeof pb.files.getUrl>[0], filename);
}

export default pb;