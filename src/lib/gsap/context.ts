/**
 * ============================================================
 * GSAP context helpers (shared)
 * ============================================================
 * Used by every component in the GSAP suite. Keeps three things
 * consistent so demos behave identically across the suite:
 *
 *   1. Lazy, SSR-safe gsap import (loadGsap)
 *   2. Plugin registration that survives HMR + StrictMode (registerGsapPlugins)
 *   3. Reduced-motion contract (prefersReducedMotion + onReducedMotionChange)
 *   4. A tiny gsap.context wrapper for Svelte onMount that returns a cleanup
 *      function (createGsapScope) so reverts are never forgotten.
 *
 * This file extends — does not replace — the older src/lib/gsapMotion.ts
 * exports. Existing components keep working. New components should import
 * from here.
 * ============================================================
 */

import { loadGsap as _loadGsap, type Gsap, REDUCED_MOTION_QUERY } from '$lib/gsapMotion';

export { type Gsap, REDUCED_MOTION_QUERY } from '$lib/gsapMotion';

export type GsapPluginName = 'ScrollTrigger' | 'SplitText' | 'Draggable' | 'Flip' | 'MotionPathPlugin' | 'Observer' | 'CustomEase';

const pluginLoaders: Record<GsapPluginName, () => Promise<unknown>> = {
	ScrollTrigger: () => import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger),
	SplitText: () => import('gsap/SplitText').then((m) => m.SplitText),
	Draggable: () => import('gsap/Draggable').then((m) => m.Draggable),
	Flip: () => import('gsap/Flip').then((m) => m.Flip),
	MotionPathPlugin: () => import('gsap/MotionPathPlugin').then((m) => m.MotionPathPlugin),
	Observer: () => import('gsap/Observer').then((m) => m.Observer),
	CustomEase: () => import('gsap/CustomEase').then((m) => m.CustomEase)
};

const registered = new Set<GsapPluginName>();

export async function loadGsap(): Promise<Gsap> {
	return _loadGsap();
}

/**
 * Loads gsap and registers the requested plugins exactly once per page load.
 * Subsequent calls are cached: registering the same plugin twice is a no-op.
 */
export async function registerGsapPlugins(plugins: GsapPluginName[] = []): Promise<Gsap> {
	const gsap = await _loadGsap();
	const pending = plugins.filter((name) => !registered.has(name));
	if (pending.length === 0) return gsap;

	const resolved = await Promise.all(pending.map((name) => pluginLoaders[name]()));
	gsap.registerPlugin(...(resolved as Parameters<Gsap['registerPlugin']>));
	pending.forEach((name) => registered.add(name));
	return gsap;
}

/**
 * Returns true when the user has asked for reduced motion. SSR-safe (returns false on the server).
 */
export function prefersReducedMotion(target?: Pick<Window, 'matchMedia'>): boolean {
	const win = target ?? (typeof window !== 'undefined' ? window : undefined);
	return Boolean(win?.matchMedia?.(REDUCED_MOTION_QUERY).matches);
}

/**
 * Subscribes to reduced-motion preference changes. Returns an unsubscribe function.
 * SSR-safe: when window is undefined this is a no-op and returns a noop cleanup.
 */
export function onReducedMotionChange(handler: (reduced: boolean) => void): () => void {
	if (typeof window === 'undefined') return () => undefined;
	const mq = window.matchMedia(REDUCED_MOTION_QUERY);
	const listener = (event: MediaQueryListEvent) => handler(event.matches);
	mq.addEventListener('change', listener);
	return () => mq.removeEventListener('change', listener);
}

export interface GsapScope {
	context: ReturnType<Gsap['context']>;
	gsap: Gsap;
	revert: () => void;
}

/**
 * Creates a gsap.context bound to the given scope element and returns the
 * context plus a `revert` shortcut. Pair with onMount and call `scope.revert()`
 * inside the cleanup function so all selectors and tweens disappear on unmount.
 *
 * Example:
 *   onMount(() => {
 *     let scope: GsapScope | null = null;
 *     (async () => {
 *       const gsap = await registerGsapPlugins(['ScrollTrigger']);
 *       scope = createGsapScope(gsap, root, () => {
 *         gsap.from('[data-reveal]', { y: 32, opacity: 0, stagger: 0.08 });
 *       });
 *     })();
 *     return () => scope?.revert();
 *   });
 */
export function createGsapScope(gsap: Gsap, scope: Element, run: () => void): GsapScope {
	const context = gsap.context(run, scope);
	return {
		context,
		gsap,
		revert: () => context.revert()
	};
}
