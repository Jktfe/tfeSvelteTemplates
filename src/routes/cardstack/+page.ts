/**
 * Page Configuration
 *
 * Disables SSR for this page because @humanspeak/svelte-motion
 * has SSR compatibility issues with Object.defineProperty in Vite 6.
 *
 * The motion components work perfectly in the browser, but fail during
 * server-side rendering. This is a known issue with the library.
 */

export const ssr = false;
