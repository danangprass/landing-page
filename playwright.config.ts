import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    globalSetup: './tests/global-setup.cjs',
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
        reuseExistingServer: true,
    },
    testDir: 'tests',
    testMatch: '**/*.spec.ts',
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
