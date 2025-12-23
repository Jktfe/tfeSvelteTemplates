/**
 * Scroll Lock Utility
 *
 * Coordinates body scroll locking between multiple components (modals, drawers, etc.)
 * Uses a reference count to prevent conflicts when multiple components try to lock scroll.
 *
 * Problem solved:
 * When multiple components (Navbar, Editor modal, FolderFiles modal) all modify
 * document.body.style.overflow, the last one to close "wins" and may restore
 * scroll incorrectly. This utility ensures proper coordination.
 *
 * @module scrollLock
 */

/**
 * Reference count for scroll locks
 * Incremented when a component locks, decremented when it unlocks
 */
let lockCount = 0;

/**
 * Original overflow value before first lock
 * Restored only when all locks are released
 */
let originalOverflow: string | null = null;

/**
 * Lock body scroll (prevent scrolling)
 *
 * Safe to call multiple times - uses reference counting.
 * Only applies overflow:hidden on first lock.
 *
 * @returns Unlock function to release this specific lock
 *
 * @example
 * ```typescript
 * // In component mount/open
 * const unlock = lockScroll();
 *
 * // In component unmount/close
 * unlock();
 * ```
 */
export function lockScroll(): () => void {
	// SSR guard - only run in browser
	if (typeof document === 'undefined') {
		return () => {};
	}

	// First lock - save original value
	if (lockCount === 0) {
		originalOverflow = document.body.style.overflow || '';
		document.body.style.overflow = 'hidden';
	}

	lockCount++;

	// Track if this specific lock has been released
	let released = false;

	// Return unlock function for this specific call
	return () => {
		// Prevent double-release
		if (released) return;
		released = true;

		lockCount--;

		// Last unlock - restore original value
		if (lockCount === 0 && originalOverflow !== null) {
			document.body.style.overflow = originalOverflow;
			originalOverflow = null;
		}
	};
}

/**
 * Check if scroll is currently locked
 *
 * @returns true if any component has locked scroll
 */
export function isScrollLocked(): boolean {
	return lockCount > 0;
}

/**
 * Get current lock count (for debugging)
 *
 * @returns Number of active scroll locks
 */
export function getScrollLockCount(): number {
	return lockCount;
}

/**
 * Force release all scroll locks
 *
 * Use with caution - only for emergency cleanup (e.g., error boundaries)
 * Normal usage should rely on individual unlock functions.
 */
export function forceUnlockAll(): void {
	if (typeof document === 'undefined') return;

	lockCount = 0;
	if (originalOverflow !== null) {
		document.body.style.overflow = originalOverflow;
		originalOverflow = null;
	}
}

/**
 * Svelte action for scroll locking
 *
 * Automatically locks scroll when element is mounted,
 * unlocks when element is destroyed.
 *
 * @param _node - The element this action is attached to (unused but required)
 * @returns Action lifecycle object
 *
 * @example
 * ```svelte
 * <div class="modal" use:scrollLockAction>
 *   Modal content...
 * </div>
 * ```
 */
export function scrollLockAction(_node: HTMLElement): { destroy: () => void } {
	const unlock = lockScroll();

	return {
		destroy() {
			unlock();
		}
	};
}
