/**
 * Browser Utilities
 *
 * SSR-safe utilities for browser-specific operations.
 * All functions check for browser environment before accessing window/document APIs.
 *
 * @module browser
 */

/**
 * Check if code is running in a browser environment
 *
 * @returns true if running in browser, false if SSR
 */
export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if user prefers reduced motion
 *
 * SSR-safe - returns false on server (animations enabled by default,
 * will be disabled client-side if user prefers reduced motion)
 *
 * @returns true if user prefers reduced motion
 *
 * @example
 * ```typescript
 * const duration = prefersReducedMotion() ? 0 : 300;
 * ```
 */
export function prefersReducedMotion(): boolean {
	if (!isBrowser()) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device has touch capability
 *
 * SSR-safe - returns false on server
 *
 * @returns true if device supports touch
 */
export function isTouchDevice(): boolean {
	if (!isBrowser()) return false;
	return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

/**
 * Check if device prefers dark colour scheme
 *
 * SSR-safe - returns false on server
 *
 * @returns true if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
	if (!isBrowser()) return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get viewport dimensions
 *
 * SSR-safe - returns { width: 0, height: 0 } on server
 *
 * @returns Object with width and height
 */
export function getViewportSize(): { width: number; height: number } {
	if (!isBrowser()) return { width: 0, height: 0 };
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

/**
 * Add event listener with SSR guard
 *
 * Returns a cleanup function that removes the listener.
 * Safe to call on server - no-op.
 *
 * @param target - Event target (window, document, or element)
 * @param event - Event name
 * @param handler - Event handler
 * @param options - Event listener options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const cleanup = addSafeListener(window, 'resize', handleResize);
 * // Later:
 * cleanup();
 * ```
 */
export function addSafeListener<K extends keyof WindowEventMap>(
	target: Window | Document | HTMLElement | null,
	event: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
): () => void {
	if (!isBrowser() || !target) {
		return () => {};
	}

	target.addEventListener(event, handler as EventListener, options);

	return () => {
		target.removeEventListener(event, handler as EventListener, options);
	};
}

/**
 * Safely access localStorage
 *
 * SSR-safe - returns null on server or if localStorage is unavailable
 *
 * @param key - Storage key
 * @returns Stored value or null
 */
export function getLocalStorage(key: string): string | null {
	if (!isBrowser()) return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

/**
 * Safely set localStorage
 *
 * SSR-safe - no-op on server or if localStorage is unavailable
 *
 * @param key - Storage key
 * @param value - Value to store
 * @returns true if successful
 */
export function setLocalStorage(key: string, value: string): boolean {
	if (!isBrowser()) return false;
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Request animation frame with SSR guard
 *
 * SSR-safe - uses setTimeout fallback on server
 *
 * @param callback - Animation callback
 * @returns Request ID (can be passed to cancelAnimationFrame)
 */
export function safeRequestAnimationFrame(callback: FrameRequestCallback): number {
	if (!isBrowser()) {
		return setTimeout(callback, 16) as unknown as number;
	}
	return requestAnimationFrame(callback);
}

/**
 * Cancel animation frame with SSR guard
 *
 * @param id - Request ID from safeRequestAnimationFrame
 */
export function safeCancelAnimationFrame(id: number): void {
	if (!isBrowser()) {
		clearTimeout(id);
		return;
	}
	cancelAnimationFrame(id);
}
