/**
 * ============================================================
 * Vitest Configuration
 * ============================================================
 *
 * This sets up our testing environment for Svelte 5 components.
 *
 * What's happening here:
 *   - We're using jsdom to simulate a browser environment
 *   - SvelteKit's Vite plugin handles all the Svelte compilation
 *   - Tests live alongside their components (co-located)
 *   - Global test utilities are available without imports
 *
 * Run tests with:
 *   bun run test        - Run all tests once
 *   bun run test:watch  - Watch mode (re-runs on changes)
 *   bun run test:ui     - Visual interface (great for debugging!)
 *
 * ============================================================
 */

import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	// Use the Svelte plugin directly (not sveltekit) for testing
	// This gives us more control over the compilation mode
	plugins: [
		svelte({
			// Hot module replacement off for tests
			hot: false
		})
	],

	// Critical for Svelte 5: Tell Vite to use browser/client exports, not server
	// Without this, Svelte imports the SSR version which can't mount components
	resolve: {
		conditions: ['browser']
	},

	test: {
		// Makes describe, it, expect available globally (no imports needed)
		globals: true,

		// Simulates a browser environment for component testing
		environment: 'jsdom',

		// Where to find test files - we're co-locating them with components
		include: ['src/**/*.{test,spec}.ts'],

		// Setup file runs before each test file
		setupFiles: ['./vitest.setup.ts'],

		// Helpful for debugging - shows which tests are slow
		slowTestThreshold: 500,

		// Tell Vitest how to resolve SvelteKit aliases
		alias: {
			$lib: '/src/lib',
			$app: '/node_modules/@sveltejs/kit/src/runtime/app'
		},

		// Coverage reporting (optional but nice to have)
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/**/*.d.ts',
				'src/**/*.test.ts',
				'src/**/*.spec.ts'
			]
		}
	}
});
