/**
 * ============================================================
 * Vitest Setup File
 * ============================================================
 *
 * This file runs before every test. It sets up:
 *   - DOM matchers (toBeInTheDocument, toHaveClass, etc.)
 *   - Automatic cleanup after each test
 *   - Any global mocks we might need
 *
 * Think of this as the "get the testing room ready" step!
 *
 * ============================================================
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Clean up the DOM after each test
// This prevents tests from accidentally affecting each other
afterEach(() => {
	cleanup();
});

// Mock matchMedia for components that check for reduced motion
// Some of our components respect prefers-reduced-motion, so we need this
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})
});

// Mock ResizeObserver (used by some components for responsive behaviour)
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
