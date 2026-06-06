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
import { afterEach, vi } from 'vitest';

type TweenVars = {
	onComplete?: () => void;
	onUpdate?: (this: { targets: () => unknown[] }) => void;
	[key: string]: unknown;
};

function runTweenCallbacks(target: unknown, vars?: TweenVars) {
	vars?.onUpdate?.call({ targets: () => [target] });
	vars?.onComplete?.();
}

function createGsapTimeline(options?: TweenVars) {
	const timeline = {
		to(target: unknown, vars?: TweenVars) {
			runTweenCallbacks(target, vars);
			options?.onComplete?.();
			return timeline;
		},
		from(target: unknown, vars?: TweenVars) {
			runTweenCallbacks(target, vars);
			options?.onComplete?.();
			return timeline;
		},
		fromTo(target: unknown, _fromVars?: TweenVars, toVars?: TweenVars) {
			runTweenCallbacks(target, toVars);
			options?.onComplete?.();
			return timeline;
		},
		set(target: unknown, vars?: TweenVars) {
			runTweenCallbacks(target, vars);
			return timeline;
		},
		kill() {
			return timeline;
		}
	};
	return timeline;
}

const gsapMock = {
	context(run: () => void) {
		run();
		return { revert: () => undefined };
	},
	from(target: unknown, vars?: TweenVars) {
		runTweenCallbacks(target, vars);
		return {};
	},
	fromTo(target: unknown, _fromVars?: TweenVars, toVars?: TweenVars) {
		runTweenCallbacks(target, toVars);
		return {};
	},
	killTweensOf: () => undefined,
	registerPlugin: () => undefined,
	set(target: unknown, vars?: TweenVars) {
		runTweenCallbacks(target, vars);
		return {};
	},
	ticker: {
		add: () => undefined,
		remove: () => undefined
	},
	timeline: createGsapTimeline,
	to(target: unknown, vars?: TweenVars) {
		if (
			target &&
			typeof target === 'object' &&
			vars &&
			'value' in vars &&
			'value' in target
		) {
			(target as { value: unknown }).value = vars.value;
		}
		runTweenCallbacks(target, vars);
		return {};
	}
};

const flipMock = {
	fit: () => null,
	from: (_state: unknown, vars?: TweenVars) => {
		vars?.onComplete?.();
		return {};
	},
	getState: () => null
};

vi.mock('gsap', () => ({ default: gsapMock, gsap: gsapMock }));
vi.mock('gsap/Flip', () => ({ Flip: flipMock }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('gsap/SplitText', () => ({ SplitText: class SplitText {} }));
vi.mock('gsap/Draggable', () => ({ Draggable: {} }));
vi.mock('gsap/MotionPathPlugin', () => ({ MotionPathPlugin: {} }));
vi.mock('gsap/Observer', () => ({ Observer: {} }));
vi.mock('gsap/CustomEase', () => ({ CustomEase: {} }));

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
