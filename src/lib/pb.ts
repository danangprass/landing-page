import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const PB_URL = env.PUBLIC_PB_URL ?? 'http://localhost:8090';

/**
 * In-memory auth store for the browser PocketBase client.
 * Never persists the token to localStorage or readable cookies.
 * The server manages the httpOnly auth cookie in hooks.server.ts.
 */
class MemoryAuthStore {
	token = '';
	model: Record<string, unknown> | null = null;

	get isValid() {
		return !!this.token;
	}

	get isAdmin() {
		return false;
	}

	get record() {
		return this.model;
	}

	private _callbacks: Array<(token: string, model: Record<string, unknown> | null) => void> = [];

	save(token: string, model: Record<string, unknown> | null) {
		this.token = token;
		this.model = model;
		for (const cb of this._callbacks) {
			cb(token, model);
		}
	}

	clear() {
		this.token = '';
		this.model = null;
		for (const cb of this._callbacks) {
			cb('', null);
		}
	}

	onChange(callback: (token: string, model: Record<string, unknown> | null) => void) {
		this._callbacks.push(callback);
		return () => {
			const idx = this._callbacks.indexOf(callback);
			if (idx >= 0) this._callbacks.splice(idx, 1);
		};
	}
}

// Client-only singleton. Never use this in server-side code (hooks, +page.server.ts, +layout.server.ts).
// Server-side code should use event.locals.pb which is a fresh per-request instance.
export const pb = new PocketBase(
	PB_URL,
	browser ? (new MemoryAuthStore() as unknown as InstanceType<typeof PocketBase>['authStore']) : undefined
);

export function getImageUrl(record: unknown, filename: string | undefined): string {
	if (!filename) return '';
	if (filename.startsWith('http') || filename.startsWith('/')) return filename;
	return pb.files.getUrl(record as Parameters<typeof pb.files.getUrl>[0], filename);
}

export default pb;
