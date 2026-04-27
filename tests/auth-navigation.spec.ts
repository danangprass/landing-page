import { test, expect } from '@playwright/test';

test.describe('Sign in navigation comparison: Navbar vs Register page', () => {

    test('Navbar Sign in link navigates directly to /login', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find the "Sign in" link in navbar (now a direct <a> tag)
        const signInLink = page.locator('nav a:has-text("Sign in")').first();
        await expect(signInLink).toBeVisible();
        await expect(signInLink).toHaveAttribute('href', '/login');

        // Click should navigate directly to /login
        await signInLink.click();
        await expect(page).toHaveURL(/\/login/);

        // Verify login page loaded
        await expect(page.locator('h1:has-text("Sign in")')).toBeVisible();
    });

    test('Register page Sign in link navigates to /login', async ({ page }) => {
        await page.goto('/register');
        await page.waitForLoadState('networkidle');

        // Find "Already have an account? Sign in" text and link
        const signInLink = page.locator('a.auth-link:has-text("Sign in")').first();
        await expect(signInLink).toBeVisible();

        // Verify the href points to /login
        await expect(signInLink).toHaveAttribute('href', '/login');

        // Click the link
        await signInLink.click();

        // Should navigate to /login
        await expect(page).toHaveURL(/\/login/);

        // Verify login page loaded
        await expect(page.locator('h1:has-text("Sign in")')).toBeVisible();
    });

    test('Both Sign in links use same href target', async ({ page }) => {
        // Check navbar Sign in href
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const navbarSignIn = page.locator('nav a:has-text("Sign in")').first();
        const navbarHref = await navbarSignIn.getAttribute('href');

        // Check register page Sign in href
        await page.goto('/register');
        await page.waitForLoadState('networkidle');

        const registerSignIn = page.locator('a.auth-link:has-text("Sign in")').first();
        const registerHref = await registerSignIn.getAttribute('href');

        // Both should point to /login
        expect(navbarHref).toBe('/login');
        expect(registerHref).toBe('/login');
        expect(navbarHref).toBe(registerHref);
    });

    test('Navbar Sign in is an <a> tag (direct link), register Sign in is also an <a> tag', async ({ page }) => {
        // Navbar: Sign in is now a direct <a> link
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const navbarSignIn = page.locator('nav a:has-text("Sign in")').first();
        await expect(navbarSignIn).toBeVisible();
        expect(await navbarSignIn.evaluate(el => el.tagName.toLowerCase())).toBe('a');

        // Register page: Sign in is an <a> direct link
        await page.goto('/register');
        await page.waitForLoadState('networkidle');

        const registerSignIn = page.locator('a.auth-link:has-text("Sign in")').first();
        await expect(registerSignIn).toBeVisible();
        expect(await registerSignIn.evaluate(el => el.tagName.toLowerCase())).toBe('a');
    });

    test('Sign in link in login page redirects back to register', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Login page should have "Create one" link to /register
        const createAccountLink = page.locator('a.auth-link:has-text("Create one")').first();
        await expect(createAccountLink).toBeVisible();
        await expect(createAccountLink).toHaveAttribute('href', '/register');
    });

    test('No auth popover exists after clicking navbar Sign in', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Click Sign in
        const signInLink = page.locator('nav a:has-text("Sign in")').first();
        await signInLink.click();

        // Should NOT show any popover — should navigate directly
        await expect(page).toHaveURL(/\/login/);

        // No popover element should exist
        const popover = page.locator('.auth-popover');
        await expect(popover).toHaveCount(0);
    });
});
