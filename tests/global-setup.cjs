const fs = require('fs');
const path = require('path');

/**
 * Global setup: create a real authenticated session for E2E tests.
 *
 * Logs into PocketBase as the E2E test user and saves the auth cookie
 * to playwright/.auth/user.json so tests can reuse it via storageState.
 */
module.exports = async function globalSetup() {
	const PB_URL = process.env.PUBLIC_PB_URL || 'http://localhost:8090';

	// Log in as the E2E test user
	const res = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			identity: 'danang@example.com',
			password: 'password12',
		}),
	});

	if (!res.ok) {
		console.warn('[globalSetup] Could not authenticate E2E test user — authenticated tests will be skipped');
		return;
	}

	const { token, record } = await res.json();

	const storageState = {
		cookies: [
			{
				name: 'pb_auth',
				value: encodeURIComponent(JSON.stringify({ token, model: record })),
				domain: 'localhost',
				path: '/',
				httpOnly: true,
				sameSite: 'Strict',
				expires: Math.floor(Date.now() / 1000) + 604800,
			},
		],
		origins: [],
	};

	const authDir = path.join(process.cwd(), 'playwright', '.auth');
	fs.mkdirSync(authDir, { recursive: true });
	fs.writeFileSync(path.join(authDir, 'user.json'), JSON.stringify(storageState, null, 2));
	console.log('[globalSetup] Authenticated session saved for danang@example.com');
};

// Self-execute when run directly (node tests/global-setup.cjs)
if (require.main === module) {
	module.exports().catch((err) => {
		console.error('[globalSetup] Failed:', err);
		process.exit(1);
	});
}
