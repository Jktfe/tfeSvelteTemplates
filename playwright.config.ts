/**
 * ============================================================
 * Playwright Configuration
 * ============================================================
 *
 * Configuration for end-to-end tests using Playwright.
 * Tests run against both desktop (Chromium) and mobile (WebKit/Safari).
 *
 * Key features:
 *   - Desktop and mobile viewports
 *   - WebKit for iOS Safari emulation
 *   - Automatic dev server startup
 *   - Screenshot on failure
 *
 * Run tests:
 *   bun run test:e2e         - Run all E2E tests
 *   bun run test:e2e:ui      - Run with Playwright UI
 *   bun run test:e2e:headed  - Run in headed mode
 *
 * ============================================================
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	// Test directory
	testDir: './tests',

	// Run tests in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use
	reporter: 'html',

	// Shared settings for all the projects below
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: 'http://localhost:5173',

		// Collect trace when retrying the failed test
		trace: 'on-first-retry',

		// Capture screenshot on failure
		screenshot: 'only-on-failure'
	},

	// Configure projects for major browsers and devices
	projects: [
		// Desktop browsers
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},

		// Mobile Safari (iOS) - for iOS Simulator testing comparison
		{
			name: 'webkit',
			use: { ...devices['iPhone 14'] }
		},

		// Tablet viewport (iPad)
		{
			name: 'tablet',
			use: { ...devices['iPad Mini'] }
		},

		// Smallest mobile viewport
		{
			name: 'mobile-small',
			use: { ...devices['iPhone SE'] }
		}
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
